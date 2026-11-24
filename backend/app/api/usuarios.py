from fastapi import APIRouter, Depends, Query
from sqlalchemy.engine import Connection

from app.core.deps import get_current_user, require_role
from app.core.postgres import get_db
from app.schemas.auth import UsuarioOut
from app.schemas.usuario import AccountState, StaffUserIn, UserRole
from app.services import account_service

router = APIRouter(tags=["Usuarios"])


@router.get("/usuarios", response_model=list[UsuarioOut])
def list_users(
    role: UserRole | None = Query(default=None, alias="rol"),
    account_state: AccountState | None = Query(default=None, alias="estado_cuenta"),
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    return account_service.list_users(db, role, account_state)


@router.get("/nutricionistas", response_model=list[UsuarioOut])
def list_nutritionists(db: Connection = Depends(get_db), user: dict = Depends(get_current_user)):
    return account_service.list_nutritionists(db)


@router.post("/usuarios", response_model=UsuarioOut, status_code=201)
def create_user(data: StaffUserIn, db: Connection = Depends(get_db), user: dict = Depends(require_role("admin"))):
    return account_service.create_staff_user(db, data.nombre, data.email, data.rol, data.especialidad, data.contrasena)
