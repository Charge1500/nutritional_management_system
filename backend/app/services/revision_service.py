from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.core.errors import AppError, sin_permiso


def _get_pending_menu(db: Connection, id_menu: int) -> dict:
    """Obtiene un menú pendiente o lanza el error correspondiente."""
    menu = db.execute(text("""
        SELECT id_menu, id_dieta, estado
        FROM menu
        WHERE id_menu = :id_menu
        FOR UPDATE
    """), {"id_menu": id_menu}).mappings().first()
    if menu is None:
        raise AppError(404, "NO_ENCONTRADO", "El menú no existe.")
    if menu["estado"] != "pendiente":
        raise AppError(409, "MENU_NO_PENDIENTE", "Solo se pueden revisar menús pendientes.")
    return dict(menu)


def _next_revision(db: Connection, id_menu: int) -> int:
    """Obtiene el siguiente número consecutivo de revisión."""
    num_revision = db.execute(text("""
        SELECT COALESCE(MAX(num_revision), 0) + 1
        FROM revision_menu
        WHERE id_menu = :id_menu
    """), {"id_menu": id_menu}).scalar_one()
    return int(num_revision)


def review_menu(
    db: Connection,
    id_menu: int,
    user: dict,
    resultado: str,
    observaciones: str | None = None,
) -> dict:
    """Aprueba o rechaza un menú pendiente."""
    if user["rol"] != "jefe":
        raise sin_permiso()
    if resultado not in ("aprobado", "rechazado"):
        raise AppError(422, "DATOS_INVALIDOS", "El resultado de revisión no es válido.")
    if resultado == "rechazado" and (
        observaciones is None or not observaciones.strip()
    ):
        raise AppError(
            422,
            "DATOS_INVALIDOS",
            "Las observaciones son obligatorias al rechazar un menú.",
            {"observaciones": "Debe indicar las correcciones requeridas."},
        )

    try:
        menu = _get_pending_menu(db, id_menu)
        num_revision = _next_revision(db, id_menu)
        revision = db.execute(text("""
            INSERT INTO revision_menu (
                id_menu, num_revision, id_jefe, resultado, observaciones
            )
            VALUES (
                :id_menu, :num_revision, :id_jefe,
                CAST(:resultado AS resultado_revision), :observaciones
            )
            RETURNING id_menu, num_revision, id_jefe, fecha_revision,
                      resultado, observaciones
        """), {
            "id_menu": id_menu,
            "num_revision": num_revision,
            "id_jefe": user["id_usuario"],
            "resultado": resultado,
            "observaciones": observaciones.strip() if observaciones else None,
        }).mappings().first()

        db.execute(text("""
            UPDATE menu
            SET estado = CAST(:estado AS estado_menu)
            WHERE id_menu = :id_menu
        """), {
            "id_menu": id_menu,
            "estado": resultado,
        })
        db.commit()
    except Exception:
        db.rollback()
        raise

    fila = dict(revision)
    fila["jefe"] = {
        "id_usuario": fila["id_jefe"],
        "nombre": user["nombre"],
    }
    return fila
