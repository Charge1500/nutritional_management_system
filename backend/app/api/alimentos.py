from fastapi import APIRouter, Depends, Query, Response
from pymongo.database import Database
from sqlalchemy.engine import Connection

from app.core.deps import get_current_user, require_role
from app.core.errors import AppError
from app.core.mongo import get_mongo_db
from app.core.postgres import get_db
from app.schemas.catalogo import (
    CalorieLevel,
    CatalogStatus,
    DuplicatePairOut,
    FoodDetailOut,
    FoodIn,
    FoodOut,
    PreparationType,
)
from app.services import alimento_service, ficha_service

router = APIRouter(prefix="/alimentos", tags=["Alimentos"])


@router.get("", response_model=list[FoodOut])
def list_foods(
    state: CatalogStatus | None = Query(default=None, alias="estado"),
    group_id: int | None = Query(default=None, alias="id_grupo"),
    preparation_type: PreparationType | None = Query(default=None, alias="tipo_preparacion"),
    calorie_level: CalorieLevel | None = Query(default=None, alias="nivel_calorico"),
    db: Connection = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    return alimento_service.list_foods(db, state, group_id, preparation_type, calorie_level)


@router.get("/duplicados", response_model=list[DuplicatePairOut])
def list_possible_duplicates(db: Connection = Depends(get_db), user: dict = Depends(require_role("admin"))):
    return alimento_service.find_possible_duplicates(db)


@router.get("/{food_id}", response_model=FoodDetailOut)
def get_food(
    food_id: int,
    db: Connection = Depends(get_db),
    mongo_db: Database = Depends(get_mongo_db),
    user: dict = Depends(get_current_user),
):
    food = alimento_service.get_food(db, food_id)
    if food is None:
        raise AppError(404, "NO_ENCONTRADO", "El alimento no existe.")
    food["ficha"] = ficha_service.get_sheet_or_none(mongo_db, food_id)  # null si no hay ficha o Mongo no responde
    return food


@router.post("", response_model=FoodDetailOut, status_code=201)
def create_food(
    data: FoodIn,
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("nutricionista")),  # el jefe también puede
):
    return alimento_service.create_food(
        db,
        user["id_usuario"],
        data.nombre_alimento,
        data.tipo_alimento,
        data.tipo_preparacion,
        data.nivel_calorico,
        data.estado,
        data.id_grupo_nutricional,
        data.ids_ingredientes,
    )


@router.put("/{food_id}", response_model=FoodDetailOut)
def update_food(
    food_id: int,
    data: FoodIn,
    db: Connection = Depends(get_db),
    mongo_db: Database = Depends(get_mongo_db),
    user: dict = Depends(require_role("nutricionista")),  # y además debe ser el creador
):
    food = alimento_service.update_food(
        db,
        food_id,
        user["id_usuario"],
        data.nombre_alimento,
        data.tipo_alimento,
        data.tipo_preparacion,
        data.nivel_calorico,
        data.estado,
        data.id_grupo_nutricional,
        data.ids_ingredientes,
    )
    if food is None:
        raise AppError(404, "NO_ENCONTRADO", "El alimento no existe.")
    food["ficha"] = ficha_service.get_sheet_or_none(mongo_db, food_id)
    return food


@router.delete("/{food_id}", status_code=204)
def delete_food(
    food_id: int,
    db: Connection = Depends(get_db),
    mongo_db: Database = Depends(get_mongo_db),
    user: dict = Depends(require_role("admin")),
):
    if not alimento_service.delete_food(db, food_id):
        raise AppError(404, "NO_ENCONTRADO", "El alimento no existe.")
    ficha_service.delete_sheet(mongo_db, food_id)  # primero PostgreSQL, después la ficha en Mongo
    return Response(status_code=204)