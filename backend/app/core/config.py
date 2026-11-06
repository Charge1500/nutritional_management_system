from pathlib import Path
from urllib.parse import quote_plus

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"  # backend/.env


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE, env_file_encoding="utf-8", extra="ignore", populate_by_name=True
    )

    # PostgreSQL
    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgres_host: str = "localhost"
    postgres_port: int = 5432

    # MongoDB 
    mongo_user: str = Field(alias="MONGO_INITDB_ROOT_USERNAME")
    mongo_password: str = Field(alias="MONGO_INITDB_ROOT_PASSWORD")
    mongo_host: str = "localhost"
    mongo_port: int = 27017
    mongo_db: str

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379

    # Seguridad
    secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60

    # Orígenes del frontend
    cors_origins: list[str] = ["http://localhost:5173"]

    @property
    def postgres_url(self) -> URL:
        return URL.create(
            "postgresql+psycopg",
            username=self.postgres_user,
            password=self.postgres_password,
            host=self.postgres_host,
            port=self.postgres_port,
            database=self.postgres_db,
        )

    @property
    def mongo_uri(self) -> str:
        return (
            f"mongodb://{quote_plus(self.mongo_user)}:{quote_plus(self.mongo_password)}"
            f"@{self.mongo_host}:{self.mongo_port}/?authSource=admin"
        )


settings = Settings()
