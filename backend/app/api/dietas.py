from fastapi import APIRouter, Depends, Query
from sqlalchemy.engine import Connection

from app.core.deps import get_current_user, require_role
from app.core.errors import AppError
from app.core.postgres import get_db
from app.schemas.catalogo import CatalogStatus, DietDetailOut, DietIn, DietNutritionists, DietOut
from app.services import dieta_service

router = APIRouter(prefix="/dietas", tags=["Dietas"])


def _restrictions_as_dicts(data: DietIn) -> list[dict]:
    return [restriction.model_dump() for restriction in data.restricciones]


@router.get("", response_model=list[DietOut])
def list_diets(
    state: CatalogStatus | None = Query(default=None, alias="estado"),
    authorized: bool = Query(default=False, alias="autorizadas"),
    db: Connection = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    if authorized:
        # Solo las guardadas que atiende el usuario actual.
        return dieta_service.list_diets(db, "guardado", attended_by=user["id_usuario"])
    return dieta_service.list_diets(db, state)


@router.get("/{diet_id}", response_model=DietDetailOut)
def get_diet(diet_id: int, db: Connection = Depends(get_db), user: dict = Depends(get_current_user)):
    diet = dieta_service.get_diet(db, diet_id)
    if diet is None:
        raise AppError(404, "NO_ENCONTRADO", "La dieta no existe.")
    return diet


@router.post("", response_model=DietDetailOut, status_code=201)
def create_diet(data: DietIn, db: Connection = Depends(get_db), user: dict = Depends(require_role("jefe"))):
    return dieta_service.create_diet(
        db, data.nombre_dieta, data.programa, data.estado, data.ids_grupos, _restrictions_as_dicts(data)
    )


@router.put("/{diet_id}", response_model=DietDetailOut)
def update_diet(
    diet_id: int, data: DietIn, db: Connection = Depends(get_db), user: dict = Depends(require_role("jefe"))
):
    diet = dieta_service.update_diet(
        db, diet_id, data.nombre_dieta, data.programa, data.estado, data.ids_grupos, _restrictions_as_dicts(data)
    )
    if diet is None:
        raise AppError(404, "NO_ENCONTRADO", "La dieta no existe.")
    return diet


@router.put("/{diet_id}/nutricionistas", response_model=DietNutritionists)
def set_diet_nutritionists(
    diet_id: int,
    data: DietNutritionists,
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("jefe")),
):
    ids = dieta_service.set_diet_nutritionists(db, diet_id, data.ids_nutricionista)
    if ids is None:
        raise AppError(404, "NO_ENCONTRADO", "La dieta no existe.")
    return {"ids_nutricionista": ids}