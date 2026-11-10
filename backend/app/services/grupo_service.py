from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import IntegrityError

from app.core.errors import AppError


def list_groups(db: Connection, state: str | None = None) -> list[dict]:
    sql = """
    SELECT g.id_grupo_nutricional, g.nombre_grupo, g.descripcion, g.estado, g.fecha_creacion,
           count(a.id_alimento) AS cantidad_alimentos
    FROM grupo_nutricional g
    LEFT JOIN alimento a ON a.id_grupo_nutricional = g.id_grupo_nutricional
    WHERE (CAST(:state AS estado_catalogo) IS NULL OR g.estado = CAST(:state AS estado_catalogo))
    GROUP BY g.id_grupo_nutricional
    ORDER BY g.nombre_grupo
    """
    rows = db.execute(text(sql), {"state": state}).mappings().all()
    return [dict(row) for row in rows]


def get_group(db: Connection, group_id: int) -> dict | None:
    sql = """
    SELECT id_grupo_nutricional, nombre_grupo, descripcion, estado, fecha_creacion
    FROM grupo_nutricional WHERE id_grupo_nutricional = :group_id
    """
    row = db.execute(text(sql), {"group_id": group_id}).mappings().first()
    return dict(row) if row else None


def create_group(db: Connection, name: str, description: str | None, state: str) -> dict:
    sql = """
    INSERT INTO grupo_nutricional (nombre_grupo, descripcion, estado)
    VALUES (:name, :description, CAST(:state AS estado_catalogo))
    RETURNING id_grupo_nutricional, nombre_grupo, descripcion, estado, fecha_creacion
    """
    try:
        row = db.execute(
            text(sql), {"name": name.strip(), "description": description, "state": state}
        ).mappings().first()
        db.commit()
    except IntegrityError:  # nombre_grupo es UNIQUE
        db.rollback()
        raise AppError(409, "GRUPO_DUPLICADO", "Ya existe un grupo con ese nombre.")
    return dict(row)