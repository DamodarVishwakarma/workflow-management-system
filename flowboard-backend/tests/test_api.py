from pathlib import Path

import httpx
import pytest

from app.config import Settings
from app.database import Base
from app.main import create_app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client(tmp_path: Path):
    app = create_app(
        Settings(
            secret_key="test-secret-that-is-not-used-in-production",
            database_url=f"sqlite:///{tmp_path / 'test.db'}",
            upload_dir=tmp_path / "uploads",
        )
    )
    Base.metadata.create_all(app.state.engine)
    async with app.router.lifespan_context(app):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as api:
            yield api


async def signup(client, email="owner@example.com"):
    response = await client.post(
        "/api/v1/auth/signup",
        json={"name": "Test Owner", "email": email, "password": "password123"},
    )
    assert response.status_code == 201, response.text
    return response.json()


def auth(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.anyio
async def test_signup_project_and_task_lifecycle(client):
    session = await signup(client)
    headers = auth(session["accessToken"])

    projects = (await client.get("/api/v1/projects", headers=headers)).json()
    assert len(projects) == 1
    project_id = projects[0]["id"]

    created = await client.post(
        f"/api/v1/projects/{project_id}/tasks",
        headers=headers,
        json={
            "title": "Connect React",
            "description": "Replace localStorage",
            "priority": "High",
        },
    )
    assert created.status_code == 201, created.text
    task = created.json()
    assert task["assignee"] == "TO"

    updated = await client.patch(
        f'/api/v1/tasks/{task["id"]}', headers=headers, json={"status": "done"}
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "done"
    assert (
        await client.delete(f'/api/v1/tasks/{task["id"]}', headers=headers)
    ).status_code == 204


@pytest.mark.anyio
async def test_invited_viewer_is_read_only(client):
    owner = await signup(client)
    owner_headers = auth(owner["accessToken"])
    invite_response = await client.post(
        "/api/v1/invitations",
        headers=owner_headers,
        json={"email": "viewer@example.com", "role": "Viewer"},
    )
    assert invite_response.status_code == 201, invite_response.text
    invitation = invite_response.json()

    validation = await client.get(f'/api/v1/invitations/validate/{invitation["token"]}')
    assert validation.json()["valid"] is True
    viewer = await client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Read Only",
            "email": "viewer@example.com",
            "password": "password123",
            "inviteToken": invitation["token"],
        },
    )
    assert viewer.status_code == 201, viewer.text
    viewer_headers = auth(viewer.json()["accessToken"])
    project_id = (await client.get("/api/v1/projects", headers=viewer_headers)).json()[
        0
    ]["id"]
    forbidden = await client.post(
        f"/api/v1/projects/{project_id}/tasks",
        headers=viewer_headers,
        json={"title": "Nope"},
    )
    assert forbidden.status_code == 403


@pytest.mark.anyio
async def test_workspace_data_is_isolated(client):
    first = await signup(client, "first@example.com")
    second = await signup(client, "second@example.com")
    first_project = (
        await client.get("/api/v1/projects", headers=auth(first["accessToken"]))
    ).json()[0]["id"]
    response = await client.get(
        f"/api/v1/projects/{first_project}/tasks", headers=auth(second["accessToken"])
    )
    assert response.status_code == 404


@pytest.mark.anyio
async def test_file_upload_and_download(client):
    session = await signup(client)
    headers = auth(session["accessToken"])
    project_id = (await client.get("/api/v1/projects", headers=headers)).json()[0]["id"]
    uploaded = await client.post(
        f"/api/v1/projects/{project_id}/files?name=notes.txt",
        headers={**headers, "Content-Type": "text/plain"},
        content=b"flowboard notes",
    )
    assert uploaded.status_code == 201, uploaded.text
    file = uploaded.json()
    downloaded = await client.get(file["downloadUrl"], headers=headers)
    assert downloaded.content == b"flowboard notes"
