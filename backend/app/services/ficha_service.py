import logging

from pymongo.database import Database
from pymongo.errors import PyMongoError, WriteError
from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.core.errors import AppError, sin_permiso

logger = logging.getLogger(__name__)

COLLECTION = "ficha_nutricional"


def _get_creator_id(db: Connection, food_id: int) -> int | None:
    row = db.execute(text("SELECT id_creador FROM alimento WHERE id_alimento = :food_id"), {"food_id": food_id}).first()
    return row[0] if row else None


def get_sheet(mongo_db: Database, food_id: int) -> dict | None:
    return mongo_db[COLLECTION].find_one({"id_alimento": food_id}, {"_id": 0})


def get_sheet_or_none(mongo_db: Database, food_id: int) -> dict | None:
    try:
        return get_sheet(mongo_db, food_id)
    except PyMongoError:
        logger.warning("No se pudo leer la ficha del alimento %s", food_id, exc_info=True)
        return None


def save_sheet(db: Connection, mongo_db: Database, user: dict, food_id: int, information: dict) -> dict:
    creator_id = _get_creator_id(db, food_id)
    if creator_id is None:
        raise AppError(409, "FICHA_SIN_ALIMENTO", "El alimento no existe.")
    if user["id_usuario"] != creator_id:
        raise sin_permiso()
    document = {"id_alimento": food_id, "informacion_nutricional": information}
    try:
        mongo_db[COLLECTION].replace_one({"id_alimento": food_id}, document, upsert=True)
    except WriteError:  
        raise AppError(422, "DATOS_INVALIDOS", "La ficha no cumple el esquema de la colección.")
    return document


def delete_sheet(mongo_db: Database, food_id: int) -> None:
    try:
        mongo_db[COLLECTION].delete_one({"id_alimento": food_id})
    except PyMongoError:
        logger.warning("No se pudo borrar la ficha del alimento %s (queda huérfana)", food_id, exc_info=True)