from fastapi import APIRouter, Depends, Query
from sqlalchemy.engine import Connection

from app.core.deps import get_current_user, require_role
from app.core.postgres import get_db
from app.schemas.menu import (
    AutomaticMenuIn,
    EstadoMenu,
    ManualMenuIn,
    MenuDetailOut,
    MenuSummaryOut,
    MenuUpdateIn,
    ReviewMenuIn,
    ReviewMenuOut,
)
from app.services import menu_service, revision_service

router = APIRouter(prefix="/menus", tags=["Menús"])


@router.get("", response_model=list[MenuSummaryOut])
def list_menus(
    id_dieta: int | None = Query(default=None),
    estado: EstadoMenu | None = Query(default=None),
    db: Connection = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Lista menús accesibles al usuario."""
    return menu_service.list_menus(db, user, id_dieta=id_dieta, estado=estado)


@router.get("/{menu_id}", response_model=MenuDetailOut)
def get_menu(
    menu_id: int,
    db: Connection = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Obtiene el detalle de un menú."""
    return menu_service.get_menu(db, menu_id, user)


@router.post("/automatico", response_model=MenuDetailOut, status_code=201)
def create_automatic_menu(
    data: AutomaticMenuIn,
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("nutricionista")),
):
    """Crea un menú automático en borrador."""
    return menu_service.create_automatic_menu(
        db,
        user,
        data.nombre_menu,
        data.id_dieta,
        data.cantidad_total_alimentos,
        data.proporciones,
        data.grupos_requeridos,
    )


@router.post("/manual", response_model=MenuDetailOut, status_code=201)
def create_manual_menu(
    data: ManualMenuIn,
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("jefe")),
):
    """Crea un menú manual indicado por el jefe."""
    return menu_service.create_manual_menu(
        db,
        user,
        data.nombre_menu,
        data.id_dieta,
        data.ids_alimentos,
    )


@router.put("/{menu_id}", response_model=MenuDetailOut)
def update_menu(
    menu_id: int,
    data: MenuUpdateIn,
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("nutricionista")),
):
    """Edita un menú que esté en borrador."""
    return menu_service.update_menu(
        db,
        menu_id,
        user,
        nombre_menu=data.nombre_menu,
        ids_alimentos=data.ids_alimentos,
        cantidad_total_alimentos=data.cantidad_total_alimentos,
        proporciones=data.proporciones,
        grupos_requeridos=data.grupos_requeridos,
    )


@router.delete("/{menu_id}", status_code=204)
def delete_menu(
    menu_id: int,
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("nutricionista")),
):
    """Elimina un menú que esté en borrador."""
    menu_service.delete_menu(db, menu_id, user)
    return None


@router.post("/{menu_id}/enviar-revision", response_model=MenuDetailOut)
def send_menu_to_review(
    menu_id: int,
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("nutricionista")),
):
    """Envía un menú borrador o corregido a revisión."""
    return menu_service.send_menu_to_review(db, menu_id, user)


@router.post("/{menu_id}/revision", response_model=ReviewMenuOut)
def review_menu(
    menu_id: int,
    data: ReviewMenuIn,
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("jefe")),
):
    """Aprueba o rechaza un menú pendiente."""
    return revision_service.review_menu(
        db,
        menu_id,
        user,
        data.resultado,
        data.observaciones,
    )
