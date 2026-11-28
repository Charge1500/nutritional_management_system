from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.engine import Connection

from app.core.config import settings

engine = create_engine(settings.postgres_url, pool_pre_ping=True)


def get_db() -> Iterator[Connection]:
    with engine.connect() as conn:
        yield conn
