from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import IntegrityError

from app.core.errors import AppError, credenciales_invalidas, cuenta_pendiente
from app.core.security import create_access_token, hash_password, verify_password
from app.services import usuario_service


def login(db: Connection, identificador: str, contrasena: str) -> tuple[str, dict]:
    usuario = usuario_service.get_usuario_por_identificador(db, identificador)
    if usuario is None:
        raise credenciales_invalidas()
    if usuario["rol"] == "paciente" and usuario["estado_cuenta"] == "pendiente":
        raise cuenta_pendiente()
    if not verify_password(contrasena, usuario["contrasena"]):
        raise credenciales_invalidas()
    return create_access_token(usuario["id_usuario"]), usuario


def activar_cuenta(db: Connection, id_usuario: int, email: str, contrasena: str) -> tuple[str, dict]:
    """Un paciente pendiente define su correo y contraseña y pasa a 'activa'."""
    usuario = usuario_service.get_usuario_por_id(db, id_usuario)
    if usuario is None or usuario["rol"] != "paciente" or usuario["estado_cuenta"] != "pendiente":
        raise AppError(409, "CUENTA_NO_PENDIENTE", "La cuenta no está pendiente de activación.")
    try:
        db.execute(
            text("UPDATE usuario SET email = :email, contrasena = :clave WHERE id_usuario = :id"),
            {"email": email.strip().lower(), "clave": hash_password(contrasena), "id": id_usuario},
        )
        db.execute(text("UPDATE paciente SET estado_cuenta = 'activa' WHERE id_usuario = :id"), {"id": id_usuario})
        db.commit()
    except IntegrityError:  # usuario.email es UNIQUE
        db.rollback()
        raise AppError(409, "EMAIL_EN_USO", "Ya existe un usuario con ese correo.")
    actualizado = usuario_service.get_usuario_por_id(db, id_usuario)
    return create_access_token(id_usuario), actualizado
