#Conexión a MongoDB para los scripts de esta carpeta.


import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.database import Database

# backend/database/mongo/config.py -> backend/.env
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def _required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Falta la variable {name}. Cópiala de backend/.env.example a backend/.env.")
    return value


def get_db() -> Database:
    user = quote_plus(_required("MONGO_INITDB_ROOT_USERNAME"))
    password = quote_plus(_required("MONGO_INITDB_ROOT_PASSWORD"))
    host = _required("MONGO_HOST")
    port = _required("MONGO_PORT")
    db_name = _required("MONGO_DB")
    client = MongoClient(
        f"mongodb://{user}:{password}@{host}:{port}/?authSource=admin",
        serverSelectionTimeoutMS=5000,
    )
    return client[db_name]