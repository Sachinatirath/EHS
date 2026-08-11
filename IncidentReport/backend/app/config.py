from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Incident Report API"
    database_url: str = "sqlite:///./incident_report.db"
    secret_key: str = "dev-only-insecure-secret-please-override-in-env-file-0003"
    algorithm: str = "HS256"
    access_token_expire_hours: int = 24 * 7
    cors_origins: str = "*"
    upload_dir: str = "uploads"

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
