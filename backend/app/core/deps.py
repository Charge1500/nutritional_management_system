from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.engine import Connection

from app.core.errors import AppError, sin_permiso
from app.core.postgres import get_db
from app.core.security import decode_access_token
from app.services import usuario_service

# auto_error=False: si falta el token no responde FastAPI, respondemos nosotros
# con el formato del contrato.
bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Connection = Depends(get_db),
) -> dict:
    if credentials is None:
        raise AppError(401, "NO_AUTENTICADO", "Falta el token de acceso.")
    id_usuario = decode_access_token(credentials.credentials)
    usuario = usuario_service.get_usuario_por_id(db, id_usuario)
    if usuario is None:
        raise AppError(401, "TOKEN_INVALIDO", "El usuario del token ya no existe.")
    return usuario


def require_role(*roles: str):
    permitidos = set(roles)
    if "nutricionista" in permitidos:
        permitidos.add("jefe")  # el jefe también es nutricionista

    def comprobar(usuario: dict = Depends(get_current_user)) -> dict:
        if usuario["rol"] not in permitidos:
            raise sin_permiso()
        return usuario

    return comprobar
