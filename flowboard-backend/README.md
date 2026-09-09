# Flowboard backend

FastAPI service for the Flowboard React frontend. It owns authentication, workspace isolation, role permissions, projects, tasks, invitations, and project files.

## Databases and migrations

SQLAlchemy 2.0 is the only application persistence API, and Alembic is the only production schema-management path. No raw SQL is used. The committed migration chain is portable across SQLite, PostgreSQL, and MySQL.

SQLite is intended for local development. For a deployed application, configure PostgreSQL or MySQL as the dedicated database service. The API uses a connection pool and checks connections before reuse. Browser storage is not part of backend persistence and should only be used for short-lived UI preferences, such as the selected project or view.

## Run

```bash
cd flowboard-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs` for the generated API client. Authentication endpoints accept JSON and return a bearer token. Send it as `Authorization: Bearer <token>`.

File uploads deliberately use the raw request body to avoid multipart overhead:

```bash
curl -X POST 'http://localhost:8000/api/v1/projects/PROJECT_ID/files?name=brief.pdf' \
  -H 'Authorization: Bearer TOKEN' -H 'Content-Type: application/pdf' --data-binary @brief.pdf
```

Copy `.env.example` and replace the development secret before deployment. The default is SQLite. Set `FLOWBOARD_DATABASE_URL` to a PostgreSQL `postgresql+psycopg://...` or MySQL `mysql+pymysql://...` URL and run `alembic upgrade head` to provision either database. All persistence uses SQLAlchemy ORM/expression APIs; Alembic owns schema migrations.

Create a migration after changing ORM models:

```bash
alembic revision --autogenerate -m "describe the schema change"
alembic upgrade head
```
