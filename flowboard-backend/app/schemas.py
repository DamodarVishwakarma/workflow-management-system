from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ApiModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class Role(str, Enum):
    OWNER = "Owner"
    ADMIN = "Admin"
    MEMBER = "Member"
    VIEWER = "Viewer"


class TaskStatus(str, Enum):
    TODO = "todo"
    PROGRESS = "progress"
    DONE = "done"


class Priority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class UserOut(ApiModel):
    id: str
    name: str
    email: EmailStr
    role: Role
    initials: str
    avatar_color: str = Field(alias="avatarColor")
    title: str
    workspace_id: str = Field(alias="workspaceId")


class LoginIn(ApiModel):
    email: EmailStr
    password: str


class SignupIn(ApiModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    invite_token: str | None = Field(default=None, alias="inviteToken")

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        return " ".join(value.split())


class AuthOut(ApiModel):
    access_token: str = Field(alias="accessToken")
    token_type: str = Field(default="bearer", alias="tokenType")
    user: UserOut


class ProjectCreate(ApiModel):
    name: str = Field(min_length=1, max_length=60)
    description: str = Field(default="A new workspace project.", max_length=180)
    type: str = Field(default="Software project", max_length=40)


class ProjectOut(ProjectCreate):
    id: str
    created_at: datetime = Field(alias="createdAt")


class TaskCreate(ApiModel):
    title: str = Field(min_length=1, max_length=80)
    description: str = Field(default="", max_length=2000)
    status: TaskStatus = TaskStatus.TODO
    priority: Priority = Priority.MEDIUM
    type: str = Field(default="Task", min_length=1, max_length=40)
    assignee_id: str | None = Field(default=None, alias="assigneeId")
    due_date: date | None = Field(default=None, alias="dueDate")


class TaskUpdate(ApiModel):
    title: str | None = Field(default=None, min_length=1, max_length=80)
    description: str | None = Field(default=None, max_length=2000)
    status: TaskStatus | None = None
    priority: Priority | None = None
    type: str | None = Field(default=None, min_length=1, max_length=40)
    assignee_id: str | None = Field(default=None, alias="assigneeId")
    due_date: date | None = Field(default=None, alias="dueDate")


class TaskOut(ApiModel):
    id: str
    project_id: str = Field(alias="projectId")
    title: str
    description: str
    status: TaskStatus
    priority: Priority
    type: str
    assignee_id: str = Field(alias="assigneeId")
    assignee: str
    due_date: date | None = Field(alias="dueDate")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class CommentCreate(ApiModel):
    body: str = Field(min_length=1, max_length=4000)


class CommentOut(ApiModel):
    id: str
    task_id: str = Field(alias="taskId")
    author_id: str = Field(alias="authorId")
    author_name: str = Field(alias="authorName")
    author_initials: str = Field(alias="authorInitials")
    author_avatar_color: str = Field(alias="authorAvatarColor")
    body: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class InvitationCreate(ApiModel):
    email: EmailStr
    role: Role = Role.MEMBER


class InvitationOut(ApiModel):
    id: str
    token: str
    email: EmailStr
    role: Role
    invited_by: str = Field(alias="invitedBy")
    workspace_name: str = Field(alias="workspaceName")
    status: str
    created_at: datetime = Field(alias="createdAt")
    expires_at: datetime = Field(alias="expiresAt")


class InvitationValidation(ApiModel):
    valid: bool
    invitation: InvitationOut | None = None
    error: str | None = None


class FileOut(ApiModel):
    id: str
    project_id: str = Field(alias="projectId")
    name: str
    size: int
    type: str
    created_at: datetime = Field(alias="createdAt")
    download_url: str = Field(alias="downloadUrl")
