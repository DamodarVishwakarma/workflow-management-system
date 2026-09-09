from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_prefix="FLOWBOARD_", extra="ignore"
    )

    app_name: str = "Flowboard API"
    secret_key: str = "development-only-change-me"
    access_token_minutes: int = 60 * 24
    database_url: str = "sqlite:///./data/flowboard.db"
    database_pool_size: int = Field(default=10, ge=1)
    database_max_overflow: int = Field(default=20, ge=0)
    database_pool_recycle_seconds: int = Field(default=1800, ge=0)
    upload_dir: Path = Path("data/uploads")
    cors_origins: str = "http://localhost:3000"
    max_upload_bytes: int = Field(default=10 * 1024 * 1024, ge=1)

    @property
    def allowed_origins(self) -> list[str]:
        return [
            origin.strip() for origin in self.cors_origins.split(",") if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
