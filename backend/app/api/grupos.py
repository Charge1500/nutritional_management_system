from fastapi import APIRouter, Depends, Query
from sqlalchemy.engine import Connection

from app.core.deps import get_current_user, require_role
from app.core.errors import AppError
from app.core.postgres import get_db
from app.schemas.catalogo import CatalogStatus, GroupIn, GroupOut
from app.services import grupo_service

router = APIRouter(prefix="/grupos", tags=["Grupos nutricionales"])


@router.get("", response_model=list[GroupOut])
def list_groups(
    state: CatalogStatus | None = Query(default=None, alias="estado"),
    db: Connection = Depends(get_db),
    user: dict = Depends(get_current_user),  # cualquier usuario autenticado
):
    return grupo_service.list_groups(db, state)


@router.get("/{group_id}", response_model=GroupOut)
def get_group(group_id: int, db: Connection = Depends(get_db), user: dict = Depends(get_current_user)):
    group = grupo_service.get_group(db, group_id)
    if group is None:
        raise AppError(404, "NO_ENCONTRADO", "El grupo no existe.")
    return group


@router.post("", response_model=GroupOut, status_code=201)
def create_group(
    data: GroupIn,  # cuerpo JSON validado por Pydantic
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("jefe")),  # solo el jefe
):
    return grupo_service.create_group(db, data.nombre_grupo, data.descripcion, data.estado)

@router.put("/{group_id}", response_model=GroupOut)
def update_group(
    group_id: int,
    data: GroupIn,
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("jefe")),  # solo el jefe
):
    group = grupo_service.update_group(db, group_id, data.nombre_grupo, data.descripcion, data.estado)
    if group is None:
        raise AppError(404, "NO_ENCONTRADO", "El grupo no existe.")
    return group