import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import FileResponse
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from .database import get_session
from .dependencies import CurrentUser, current_user, require_roles
from .models import Comment, Invitation, Project, StoredFile, Task, User, Workspace
from .schemas import (
    AuthOut,
    CommentCreate,
    CommentOut,
    FileOut,
    InvitationCreate,
    InvitationOut,
    InvitationValidation,
    LoginIn,
    ProjectCreate,
    ProjectOut,
    Role,
    SignupIn,
    TaskCreate,
    TaskOut,
    TaskUpdate,
    UserOut,
)
from .security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/v1")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:12]}"


def initials(name: str) -> str:
    parts = name.split()
    return ((parts[0][:1] + parts[-1][:1]) if len(parts) > 1 else parts[0][:2]).upper()


def auth_out(user: User, request: Request) -> AuthOut:
    settings = request.app.state.settings
    return AuthOut(
        accessToken=create_access_token(
            user.id, settings.secret_key, settings.access_token_minutes
        ),
        user=UserOut.model_validate(user),
    )


def invite_out(invitation: Invitation) -> InvitationOut:
    return InvitationOut(
        id=invitation.id,
        token=invitation.token,
        email=invitation.email,
        role=invitation.role,
        invitedBy=f"{invitation.invited_by.name} ({invitation.invited_by.email})",
        workspaceName=invitation.workspace.name,
        status=invitation.status,
        createdAt=invitation.created_at,
        expiresAt=invitation.expires_at,
    )


def task_out(task: Task) -> TaskOut:
    return TaskOut(
        id=task.id,
        projectId=task.project_id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        type=task.type,
        assigneeId=task.assignee_id,
        assignee=task.assignee_user.initials,
        dueDate=task.due_date,
        createdAt=task.created_at,
        updatedAt=task.updated_at,
    )


def file_out(stored_file: StoredFile) -> FileOut:
    return FileOut(
        id=stored_file.id,
        projectId=stored_file.project_id,
        name=stored_file.name,
        size=stored_file.size,
        type=stored_file.content_type,
        createdAt=stored_file.created_at,
        downloadUrl=f"/api/v1/files/{stored_file.id}/content",
    )


def comment_out(comment: Comment) -> CommentOut:
    return CommentOut(
        id=comment.id,
        taskId=comment.task_id,
        authorId=comment.author_id,
        authorName=comment.author.name,
        authorInitials=comment.author.initials,
        authorAvatarColor=comment.author.avatar_color,
        body=comment.body,
        createdAt=comment.created_at,
        updatedAt=comment.updated_at,
    )


def project_for(session, project_id, workspace_id):
    item = session.scalar(
        select(Project).where(
            Project.id == project_id, Project.workspace_id == workspace_id
        )
    )
    if not item:
        raise HTTPException(404, "Project not found")
    return item


def task_for(session, task_id, workspace_id):
    item = session.scalar(
        select(Task)
        .join(Task.project)
        .options(joinedload(Task.assignee_user))
        .where(Task.id == task_id, Project.workspace_id == workspace_id)
    )
    if not item:
        raise HTTPException(404, "Task not found")
    return item


def file_for(session, file_id, workspace_id):
    item = session.scalar(
        select(StoredFile)
        .join(StoredFile.project)
        .where(StoredFile.id == file_id, Project.workspace_id == workspace_id)
    )
    if not item:
        raise HTTPException(404, "File not found")
    return item


@router.get("/health", tags=["system"])
def health(session: Session = Depends(get_session)):
    session.scalar(select(1))
    return {"status": "ok", "database": "connected"}


@router.post("/auth/signup", response_model=AuthOut, status_code=201, tags=["auth"])
def signup(
    payload: SignupIn, request: Request, session: Session = Depends(get_session)
):  
    import time
    time.sleep(4)
    email = str(payload.email).lower()
    if session.scalar(select(User.id).where(func.lower(User.email) == email)):
        raise HTTPException(409, "An account with this email already exists")
    invitation = None
    if payload.invite_token:
        invitation = session.scalar(
            select(Invitation)
            .where(Invitation.token == payload.invite_token)
            .with_for_update()
        )
        if not invitation or invitation.status != "pending":
            raise HTTPException(400, "Invalid or already-used invitation")
        expires_at = (
            invitation.expires_at
            if invitation.expires_at.tzinfo
            else invitation.expires_at.replace(tzinfo=timezone.utc)
        )
        if expires_at < utcnow():
            raise HTTPException(400, "This invitation has expired")
        if invitation.email.lower() != email:
            raise HTTPException(400, "Email does not match the invitation")
        workspace_id, role = invitation.workspace_id, invitation.role
        invitation.status = "accepted"
    else:
        workspace_id, role = new_id("ws"), Role.OWNER
        session.add(
            Workspace(
                id=workspace_id, name=f"{payload.name}'s workspace", created_at=utcnow()
            )
        )
    user = User(
        id=new_id("usr"),
        workspace_id=workspace_id,
        name=payload.name,
        email=email,
        password_hash=hash_password(payload.password),
        role=role,
        initials=initials(payload.name),
        avatar_color="purple",
        title={
            Role.OWNER: "Workspace Creator & Lead",
            Role.ADMIN: "Workspace Administrator",
            Role.MEMBER: "Team Collaborator",
            Role.VIEWER: "Project Viewer",
        }[role],
        created_at=utcnow(),
    )
    session.add(user)
    if not invitation:
        session.add(
            Project(
                id=new_id("project"),
                workspace_id=workspace_id,
                name="My first project",
                description="Plan and track your team's work.",
                type="Software project",
                created_at=utcnow(),
            )
        )
    try:
        session.flush()
    except IntegrityError:
        raise HTTPException(409, "An account with this email already exists") from None
    return auth_out(user, request)


@router.post("/auth/login", response_model=AuthOut, tags=["auth"])
def login(payload: LoginIn, request: Request, session: Session = Depends(get_session)):
    user = session.scalar(
        select(User).where(func.lower(User.email) == str(payload.email).lower())
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    return auth_out(user, request)


@router.get("/auth/me", response_model=UserOut, tags=["auth"])
def me(
    user: CurrentUser = Depends(current_user), session: Session = Depends(get_session)
):
    return session.get(User, user.id)


@router.get("/users", response_model=list[UserOut], tags=["users"])
def users(
    user: CurrentUser = Depends(current_user), session: Session = Depends(get_session)
):
    return session.scalars(
        select(User).where(User.workspace_id == user.workspace_id).order_by(User.name)
    ).all()


@router.get("/projects", response_model=list[ProjectOut], tags=["projects"])
def projects(
    user: CurrentUser = Depends(current_user), session: Session = Depends(get_session)
):
    return session.scalars(
        select(Project)
        .where(Project.workspace_id == user.workspace_id)
        .order_by(Project.created_at)
    ).all()


@router.post("/projects", response_model=ProjectOut, status_code=201, tags=["projects"])
def create_project(
    payload: ProjectCreate,
    user: CurrentUser = Depends(require_roles(Role.OWNER, Role.ADMIN)),
    session: Session = Depends(get_session),
):
    item = Project(
        id=new_id("project"),
        workspace_id=user.workspace_id,
        name=payload.name.strip(),
        description=payload.description.strip(),
        type=payload.type,
        created_at=utcnow(),
    )
    session.add(item)
    session.flush()
    return item


@router.delete("/projects/{project_id}", status_code=204, tags=["projects"])
def delete_project(
    project_id: str,
    user: CurrentUser = Depends(require_roles(Role.OWNER, Role.ADMIN)),
    session: Session = Depends(get_session),
):
    item = project_for(session, project_id, user.workspace_id)
    if (
        session.scalar(
            select(func.count(Project.id)).where(
                Project.workspace_id == user.workspace_id
            )
        )
        == 1
    ):
        raise HTTPException(409, "A workspace must have at least one project")
    session.delete(item)
    return Response(status_code=204)


@router.get(
    "/projects/{project_id}/tasks", response_model=list[TaskOut], tags=["tasks"]
)
def tasks(
    project_id: str,
    status_filter: str | None = Query(None, alias="status"),
    priority: str | None = None,
    q: str | None = None,
    user: CurrentUser = Depends(current_user),
    session: Session = Depends(get_session),
):
    project_for(session, project_id, user.workspace_id)
    statement = (
        select(Task)
        .options(joinedload(Task.assignee_user))
        .where(Task.project_id == project_id)
    )
    if status_filter:
        statement = statement.where(Task.status == status_filter)
    if priority:
        statement = statement.where(Task.priority == priority)
    if q:
        pattern = f"%{q}%"
        statement = statement.where(
            or_(Task.title.ilike(pattern), Task.id.ilike(pattern))
        )
    return [
        task_out(item)
        for item in session.scalars(statement.order_by(Task.created_at)).all()
    ]


@router.post(
    "/projects/{project_id}/tasks",
    response_model=TaskOut,
    status_code=201,
    tags=["tasks"],
)
def create_task(
    project_id: str,
    payload: TaskCreate,
    user: CurrentUser = Depends(require_roles(Role.OWNER, Role.ADMIN, Role.MEMBER)),
    session: Session = Depends(get_session),
):
    project_for(session, project_id, user.workspace_id)
    assignee_id = payload.assignee_id or user.id
    assignee = session.scalar(
        select(User).where(
            User.id == assignee_id, User.workspace_id == user.workspace_id
        )
    )
    if not assignee:
        raise HTTPException(400, "Assignee is not a workspace member")
    item = Task(
        id=f"FLW-{uuid4().hex[:8].upper()}",
        project_id=project_id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        status=payload.status,
        priority=payload.priority,
        type=payload.type,
        assignee_id=assignee_id,
        due_date=payload.due_date,
        created_at=utcnow(),
        updated_at=utcnow(),
        assignee_user=assignee,
    )
    session.add(item)
    session.flush()
    return task_out(item)


@router.patch("/tasks/{task_id}", response_model=TaskOut, tags=["tasks"])
def update_task(
    task_id: str,
    payload: TaskUpdate,
    user: CurrentUser = Depends(require_roles(Role.OWNER, Role.ADMIN, Role.MEMBER)),
    session: Session = Depends(get_session),
):
    item = task_for(session, task_id, user.workspace_id)
    updates = payload.model_dump(exclude_unset=True)
    if "assignee_id" in updates:
        assignee = session.scalar(
            select(User).where(
                User.id == updates["assignee_id"],
                User.workspace_id == user.workspace_id,
            )
        )
        if not assignee:
            raise HTTPException(400, "Assignee is not a workspace member")
        item.assignee_user = assignee
    for key, value in updates.items():
        setattr(item, key, value)
    item.updated_at = utcnow()
    session.flush()
    return task_out(item)


@router.delete("/tasks/{task_id}", status_code=204, tags=["tasks"])
def delete_task(
    task_id: str,
    user: CurrentUser = Depends(require_roles(Role.OWNER, Role.ADMIN, Role.MEMBER)),
    session: Session = Depends(get_session),
):
    session.delete(task_for(session, task_id, user.workspace_id))
    return Response(status_code=204)


@router.get(
    "/tasks/{task_id}/comments", response_model=list[CommentOut], tags=["comments"]
)
def comments(
    task_id: str,
    user: CurrentUser = Depends(current_user),
    session: Session = Depends(get_session),
):
    task_for(session, task_id, user.workspace_id)
    statement = (
        select(Comment)
        .options(joinedload(Comment.author))
        .where(Comment.task_id == task_id)
        .order_by(Comment.created_at)
    )
    return [comment_out(item) for item in session.scalars(statement).all()]


@router.post(
    "/tasks/{task_id}/comments",
    response_model=CommentOut,
    status_code=201,
    tags=["comments"],
)
def create_comment(
    task_id: str,
    payload: CommentCreate,
    user: CurrentUser = Depends(current_user),
    session: Session = Depends(get_session),
):
    task_for(session, task_id, user.workspace_id)
    author = session.get(User, user.id)
    item = Comment(
        id=new_id("cmt"),
        task_id=task_id,
        author_id=user.id,
        body=payload.body.strip(),
        created_at=utcnow(),
        updated_at=utcnow(),
        author=author,
    )
    session.add(item)
    session.flush()
    return comment_out(item)


@router.delete("/comments/{comment_id}", status_code=204, tags=["comments"])
def delete_comment(
    comment_id: str,
    user: CurrentUser = Depends(current_user),
    session: Session = Depends(get_session),
):
    item = session.scalar(
        select(Comment)
        .join(Comment.task)
        .join(Task.project)
        .where(Comment.id == comment_id, Project.workspace_id == user.workspace_id)
    )
    if not item:
        raise HTTPException(404, "Comment not found")
    if item.author_id != user.id and user.role not in (Role.OWNER, Role.ADMIN):
        raise HTTPException(403, "You can only delete your own comments")
    session.delete(item)
    return Response(status_code=204)


def invitation_query():
    return select(Invitation).options(
        joinedload(Invitation.invited_by), joinedload(Invitation.workspace)
    )


@router.get(
    "/invitations/validate/{token}",
    response_model=InvitationValidation,
    tags=["invitations"],
)
def validate_invitation(token: str, session: Session = Depends(get_session)):
    item = session.scalar(invitation_query().where(Invitation.token == token))
    if not item:
        return InvitationValidation(valid=False, error="Invalid invitation token")
    if item.status != "pending":
        return InvitationValidation(
            valid=False, error="Invitation is no longer pending"
        )
    expires_at = (
        item.expires_at
        if item.expires_at.tzinfo
        else item.expires_at.replace(tzinfo=timezone.utc)
    )
    if expires_at < utcnow():
        return InvitationValidation(valid=False, error="Invitation has expired")
    return InvitationValidation(valid=True, invitation=invite_out(item))


@router.get("/invitations", response_model=list[InvitationOut], tags=["invitations"])
def invitations(
    user: CurrentUser = Depends(require_roles(Role.OWNER, Role.ADMIN)),
    session: Session = Depends(get_session),
):
    items = session.scalars(
        invitation_query()
        .where(Invitation.workspace_id == user.workspace_id)
        .order_by(Invitation.created_at.desc())
    ).all()
    return [invite_out(item) for item in items]


@router.post(
    "/invitations", response_model=InvitationOut, status_code=201, tags=["invitations"]
)
def create_invitation(
    payload: InvitationCreate,
    user: CurrentUser = Depends(require_roles(Role.OWNER, Role.ADMIN)),
    session: Session = Depends(get_session),
):
    if user.role == Role.ADMIN and payload.role in (Role.OWNER, Role.ADMIN):
        raise HTTPException(403, "Admins can only invite Members or Viewers")
    if payload.role == Role.OWNER:
        raise HTTPException(400, "Workspace ownership cannot be assigned by invitation")
    email = str(payload.email).lower()
    if session.scalar(select(User.id).where(func.lower(User.email) == email)):
        raise HTTPException(409, "This email already belongs to a user")
    item = Invitation(
        id=new_id("inv"),
        workspace_id=user.workspace_id,
        token=f"inv_{secrets.token_urlsafe(24)}",
        email=email,
        role=payload.role,
        invited_by_id=user.id,
        status="pending",
        created_at=utcnow(),
        expires_at=utcnow() + timedelta(days=7),
    )
    session.add(item)
    session.flush()
    item.invited_by, item.workspace = session.get(User, user.id), session.get(
        Workspace, user.workspace_id
    )
    return invite_out(item)


@router.get(
    "/projects/{project_id}/files", response_model=list[FileOut], tags=["files"]
)
def files(
    project_id: str,
    user: CurrentUser = Depends(current_user),
    session: Session = Depends(get_session),
):
    project_for(session, project_id, user.workspace_id)
    return [
        file_out(item)
        for item in session.scalars(
            select(StoredFile)
            .where(StoredFile.project_id == project_id)
            .order_by(StoredFile.created_at.desc())
        ).all()
    ]


@router.post(
    "/projects/{project_id}/files",
    response_model=FileOut,
    status_code=201,
    tags=["files"],
)
async def upload_file(
    project_id: str,
    request: Request,
    name: str = Query(..., min_length=1, max_length=255),
    user: CurrentUser = Depends(require_roles(Role.OWNER, Role.ADMIN, Role.MEMBER)),
    session: Session = Depends(get_session),
):
    project_for(session, project_id, user.workspace_id)
    body = await request.body()
    settings = request.app.state.settings
    if not body:
        raise HTTPException(400, "File is empty")
    if len(body) > settings.max_upload_bytes:
        raise HTTPException(413, "File is too large")
    safe_name = Path(name).name
    if safe_name != name:
        raise HTTPException(400, "Invalid filename")
    item = StoredFile(
        id=new_id("file"),
        project_id=project_id,
        name=safe_name,
        stored_name=uuid4().hex,
        size=len(body),
        content_type=request.headers.get("content-type", "application/octet-stream"),
        created_at=utcnow(),
    )
    destination = settings.upload_dir / item.stored_name
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(body)
    session.add(item)
    session.flush()
    return file_out(item)


@router.get("/files/{file_id}/content", tags=["files"])
def download_file(
    file_id: str,
    request: Request,
    user: CurrentUser = Depends(current_user),
    session: Session = Depends(get_session),
):
    item = file_for(session, file_id, user.workspace_id)
    return FileResponse(
        request.app.state.settings.upload_dir / item.stored_name,
        media_type=item.content_type,
        filename=item.name,
    )


@router.delete("/files/{file_id}", status_code=204, tags=["files"])
def delete_file(
    file_id: str,
    request: Request,
    user: CurrentUser = Depends(require_roles(Role.OWNER, Role.ADMIN, Role.MEMBER)),
    session: Session = Depends(get_session),
):
    item = file_for(session, file_id, user.workspace_id)
    stored_name = item.stored_name
    session.delete(item)
    session.flush()
    (request.app.state.settings.upload_dir / stored_name).unlink(missing_ok=True)
    return Response(status_code=204)
