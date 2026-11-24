from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import IntegrityError

from app.core.errors import AppError
from app.core.security import hash_password
from app.services import usuario_service

_USERS = f"SELECT * FROM ({usuario_service._SELECT_USUARIO}) AS u"


def _public(row) -> dict:
    user = dict(row)
    user.pop("contrasena", None)
    return user


def list_users(db: Connection, role: str | None = None, account_state: str | None = None) -> list[dict]:
    sql = f"""{_USERS}
    WHERE (CAST(:role AS TEXT) IS NULL OR u.rol = CAST(:role AS TEXT))
      AND (CAST(:account_state AS estado_cuenta) IS NULL OR u.estado_cuenta = CAST(:account_state AS estado_cuenta))
    ORDER BY u.id_usuario"""
    rows = db.execute(text(sql), {"role": role, "account_state": account_state}).mappings().all()
    return [_public(row) for row in rows]


def list_nutritionists(db: Connection) -> list[dict]:
    sql = f"{_USERS} WHERE u.rol IN ('nutricionista', 'jefe') ORDER BY u.nombre"
    return [_public(row) for row in db.execute(text(sql)).mappings().all()]


def _next_user_id(db: Connection) -> int:
    return db.execute(text("SELECT nextval(pg_get_serial_sequence('usuario', 'id_usuario'))")).scalar_one()


def _raise_if_duplicate_email(error: IntegrityError) -> None:
    if getattr(getattr(error.orig, "diag", None), "constraint_name", None) == "usuario_email_key":
        raise AppError(409, "EMAIL_EN_USO", "Ya existe un usuario con ese correo.")


def register_patient(db: Connection, registrar: dict, name: str, age: int, room: str, email: str | None) -> dict:
    registered_by = registrar["id_usuario"] if registrar["rol"] in ("nutricionista", "jefe") else None
    try:
        user_id = _next_user_id(db)
        final_email = (email or f"paciente{user_id}@menus.local").strip().lower()
        db.execute(
            text("INSERT INTO usuario (id_usuario, nombre, email) VALUES (:id, :name, :email)"),
            {"id": user_id, "name": name.strip(), "email": final_email},
        )
        db.execute(
            text(
                "INSERT INTO paciente (id_usuario, edad, sala, estado_cuenta, id_nutri_registra, fecha_registro) "
                "VALUES (:id, :age, :room, 'pendiente', CAST(:by AS INTEGER), "
                "CASE WHEN CAST(:by AS INTEGER) IS NULL THEN NULL ELSE NOW() END)"
            ),
            {"id": user_id, "age": age, "room": room.strip(), "by": registered_by},
        )
        db.commit()
    except IntegrityError as error:
        db.rollback()
        _raise_if_duplicate_email(error)
        raise
    except Exception:
        db.rollback()
        raise
    return _public(usuario_service.get_usuario_por_id(db, user_id))


def create_staff_user(
    db: Connection, name: str, email: str | None, role: str, specialty: str | None, password: str
) -> dict:
    try:
        user_id = _next_user_id(db)
        final_email = (email or f"{role}{user_id}@menus.local").strip().lower()
        db.execute(
            text("INSERT INTO usuario (id_usuario, nombre, email, contrasena) VALUES (:id, :name, :email, :password)"),
            {"id": user_id, "name": name.strip(), "email": final_email, "password": hash_password(password)},
        )
        if role == "nutricionista":
            db.execute(
                text("INSERT INTO nutricionista (id_usuario, especialidad) VALUES (:id, :specialty)"),
                {"id": user_id, "specialty": specialty},
            )
        else:  # admin
            db.execute(text("INSERT INTO administrador (id_usuario) VALUES (:id)"), {"id": user_id})
        db.commit()
    except IntegrityError as error:
        db.rollback()
        _raise_if_duplicate_email(error)
        raise
    except Exception:
        db.rollback()
        raise
    return _public(usuario_service.get_usuario_por_id(db, user_id))
