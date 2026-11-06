from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings
from app.core.errors import AppError


def _bytes(plain: str) -> bytes:
    return plain.encode("utf-8")[:72]


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(_bytes(plain), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str | None) -> bool:
    if not hashed:  # p. ej. paciente pendiente: no tiene contraseña
        return False
    try:
        return bcrypt.checkpw(_bytes(plain), hashed.encode("utf-8"))
    except ValueError:  # hash con formato inválido
        return False


def create_access_token(id_usuario: int) -> str:
    expira = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes)
    payload = {"sub": str(id_usuario), "exp": expira}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise AppError(401, "TOKEN_INVALIDO", "Sesión caducada o token inválido.")
