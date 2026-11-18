from fastapi import APIRouter, Depends
from pymongo.database import Database
from sqlalchemy.engine import Connection

from app.core.deps import get_current_user, require_role
from app.core.errors import AppError
from app.core.mongo import get_mongo_db
from app.core.postgres import get_db
from app.schemas.ficha import SheetIn, SheetOut
from app.services import ficha_service

router = APIRouter(prefix="/alimentos", tags=["Ficha nutricional"])


@router.get("/{food_id}/ficha", response_model=SheetOut)
def get_sheet(
    food_id: int,
    mongo_db: Database = Depends(get_mongo_db),
    user: dict = Depends(get_current_user),
):
    sheet = ficha_service.get_sheet(mongo_db, food_id)
    if sheet is None:
        raise AppError(404, "NO_ENCONTRADO", "El alimento no tiene ficha nutricional.")
    return sheet


@router.put("/{food_id}/ficha", response_model=SheetOut)
def save_sheet(
    food_id: int,
    data: SheetIn,
    db: Connection = Depends(get_db),
    mongo_db: Database = Depends(get_mongo_db),
    user: dict = Depends(require_role("nutricionista")),
):
    return ficha_service.save_sheet(db, mongo_db, user, food_id, data.informacion_nutricional)