from functools import lru_cache

from pymongo import MongoClient
from pymongo.database import Database

from app.core.config import settings


@lru_cache
def _client() -> MongoClient:
    # Un solo cliente para toda la aplicación.
    return MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=5000)


def get_mongo_db() -> Database:
    return _client()[settings.mongo_db]
