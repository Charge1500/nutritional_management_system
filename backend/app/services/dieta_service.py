from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import IntegrityError

from app.core.errors import AppError

_ID_TABLES = {
    "grupos": ("grupo_nutricional", "id_grupo_nutricional"),
    "alimentos": ("alimento", "id_alimento"),
    "nutricionistas": ("nutricionista", "id_usuario"),
}


def nutritionist_attends_diet(db: Connection, nutritionist_id: int, diet_id: int) -> bool:
    """¿Este usuario atiende la dieta? El jefe atiende todas.

    No comprueba que la dieta exista: quien la llame debe hacerlo aparte.
    Es la función que usa Backend 2 para validar quién genera, asigna o revisa menús.
    """
    sql = """
    SELECT EXISTS (SELECT 1 FROM nutricionista_dieta
                   WHERE id_nutricionista = :user_id AND id_dieta = :diet_id)
        OR EXISTS (SELECT 1 FROM jefe WHERE id_usuario = :user_id)
    """
    return bool(db.execute(text(sql), {"user_id": nutritionist_id, "diet_id": diet_id}).scalar())


def list_diets(db: Connection, state: str | None = None, attended_by: int | None = None) -> list[dict]:
    """Lista dietas. Con `attended_by`, solo las que atiende ese usuario (el jefe, todas)."""
    sql = """
    SELECT d.id_dieta, d.nombre_dieta, d.programa, d.estado, d.fecha_creacion
    FROM dieta d
    WHERE (CAST(:state AS estado_catalogo) IS NULL OR d.estado = CAST(:state AS estado_catalogo))
      AND (CAST(:user_id AS INTEGER) IS NULL
           OR EXISTS (SELECT 1 FROM nutricionista_dieta nd
                      WHERE nd.id_dieta = d.id_dieta AND nd.id_nutricionista = CAST(:user_id AS INTEGER))
           OR EXISTS (SELECT 1 FROM jefe j WHERE j.id_usuario = CAST(:user_id AS INTEGER)))
    ORDER BY d.nombre_dieta
    """
    rows = db.execute(text(sql), {"state": state, "user_id": attended_by}).mappings().all()
    return [dict(row) for row in rows]


def get_diet(db: Connection, diet_id: int) -> dict | None:
    """Dieta con sus grupos y sus restricciones, o None si no existe."""
    diet = db.execute(
        text(
            "SELECT id_dieta, nombre_dieta, programa, estado, fecha_creacion "
            "FROM dieta WHERE id_dieta = :diet_id"
        ),
        {"diet_id": diet_id},
    ).mappings().first()
    if diet is None:
        return None

    groups = db.execute(
        text(
            """
            SELECT g.id_grupo_nutricional, g.nombre_grupo
            FROM dieta_grupo dg
            JOIN grupo_nutricional g ON g.id_grupo_nutricional = dg.id_grupo_nutricional
            WHERE dg.id_dieta = :diet_id
            ORDER BY g.nombre_grupo
            """
        ),
        {"diet_id": diet_id},
    ).mappings().all()

    restrictions = db.execute(
        text(
            """
            SELECT a.id_alimento, a.nombre_alimento, da.cantidad_minima, da.cantidad_maxima
            FROM dieta_alimento da
            JOIN alimento a ON a.id_alimento = da.id_alimento
            WHERE da.id_dieta = :diet_id
            ORDER BY a.nombre_alimento
            """
        ),
        {"diet_id": diet_id},
    ).mappings().all()

    result = dict(diet)
    result["grupos"] = [dict(group) for group in groups]
    result["restricciones"] = [
        {
            "alimento": {"id_alimento": r["id_alimento"], "nombre_alimento": r["nombre_alimento"]},
            "cantidad_minima": r["cantidad_minima"],
            "cantidad_maxima": r["cantidad_maxima"],
        }
        for r in restrictions
    ]
    return result


def create_diet(
    db: Connection, name: str, program: str, state: str, group_ids: list[int], restrictions: list[dict]
) -> dict:
    """Crea la dieta con sus grupos y restricciones. Todo se guarda junto o no se guarda nada."""
    try:
        _check_ids_exist(db, "grupos", group_ids, "ids_grupos")
        _check_ids_exist(db, "alimentos", [r["id_alimento"] for r in restrictions], "restricciones")
        diet_id = db.execute(
            text(
                "INSERT INTO dieta (nombre_dieta, programa, estado) "
                "VALUES (:name, :program, CAST(:state AS estado_catalogo)) RETURNING id_dieta"
            ),
            {"name": name.strip(), "program": program.strip(), "state": state},
        ).scalar_one()
        _insert_children(db, diet_id, group_ids, restrictions)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        _raise_if_duplicate_name(error)
        raise
    except Exception:
        db.rollback()
        raise
    return get_diet(db, diet_id)


def update_diet(
    db: Connection, diet_id: int, name: str, program: str, state: str, group_ids: list[int], restrictions: list[dict]
) -> dict | None:
    """Reemplaza los datos, los grupos y las restricciones. Devuelve None si la dieta no existe."""
    try:
        # FOR UPDATE bloquea la fila: dos ediciones simultáneas no mezclan sus grupos.
        found = db.execute(
            text("SELECT 1 FROM dieta WHERE id_dieta = :diet_id FOR UPDATE"), {"diet_id": diet_id}
        ).first()
        if found is None:
            db.rollback()
            return None
        _check_ids_exist(db, "grupos", group_ids, "ids_grupos")
        _check_ids_exist(db, "alimentos", [r["id_alimento"] for r in restrictions], "restricciones")
        db.execute(
            text(
                "UPDATE dieta SET nombre_dieta = :name, programa = :program, "
                "estado = CAST(:state AS estado_catalogo) WHERE id_dieta = :diet_id"
            ),
            {"diet_id": diet_id, "name": name.strip(), "program": program.strip(), "state": state},
        )
        db.execute(text("DELETE FROM dieta_grupo WHERE id_dieta = :diet_id"), {"diet_id": diet_id})
        db.execute(text("DELETE FROM dieta_alimento WHERE id_dieta = :diet_id"), {"diet_id": diet_id})
        _insert_children(db, diet_id, group_ids, restrictions)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        _raise_if_duplicate_name(error)
        raise
    except Exception:
        db.rollback()
        raise
    return get_diet(db, diet_id)


def set_diet_nutritionists(db: Connection, diet_id: int, nutritionist_ids: list[int]) -> list[int] | None:
    """Define quién atiende la dieta (reemplaza la lista). Devuelve None si la dieta no existe."""
    try:
        found = db.execute(
            text("SELECT 1 FROM dieta WHERE id_dieta = :diet_id FOR UPDATE"), {"diet_id": diet_id}
        ).first()
        if found is None:
            db.rollback()
            return None
        _check_ids_exist(db, "nutricionistas", nutritionist_ids, "ids_nutricionista")
        db.execute(text("DELETE FROM nutricionista_dieta WHERE id_dieta = :diet_id"), {"diet_id": diet_id})
        if nutritionist_ids:
            db.execute(
                text("INSERT INTO nutricionista_dieta (id_nutricionista, id_dieta) VALUES (:user_id, :diet_id)"),
                [{"user_id": user_id, "diet_id": diet_id} for user_id in nutritionist_ids],
            )
        db.commit()
    except Exception:
        db.rollback()
        raise
    return sorted(nutritionist_ids)


# ------------------------------------------------------------- auxiliares
def _check_ids_exist(db: Connection, kind: str, ids: list[int], field: str) -> None:
    """Lanza 422 si algún id no existe (la API debe comprobarlo antes de insertar)."""
    if not ids:
        return
    table, column = _ID_TABLES[kind]
    found = db.execute(
        text(f"SELECT {column} FROM {table} WHERE {column} = ANY(CAST(:ids AS INTEGER[]))"),
        {"ids": list(ids)},
    ).scalars().all()
    missing = sorted(set(ids) - set(found))
    if missing:
        raise AppError(422, "DATOS_INVALIDOS", "Revise los campos marcados.", {field: f"No existen: {missing}"})


def _insert_children(db: Connection, diet_id: int, group_ids: list[int], restrictions: list[dict]) -> None:
    if group_ids:
        db.execute(
            text("INSERT INTO dieta_grupo (id_dieta, id_grupo_nutricional) VALUES (:diet_id, :group_id)"),
            [{"diet_id": diet_id, "group_id": group_id} for group_id in group_ids],
        )
    if restrictions:
        db.execute(
            text(
                "INSERT INTO dieta_alimento (id_dieta, id_alimento, cantidad_minima, cantidad_maxima) "
                "VALUES (:diet_id, :food_id, :minimum, :maximum)"
            ),
            [
                {
                    "diet_id": diet_id,
                    "food_id": r["id_alimento"],
                    "minimum": r["cantidad_minima"],
                    "maximum": r["cantidad_maxima"],
                }
                for r in restrictions
            ],
        )


def _raise_if_duplicate_name(error: IntegrityError) -> None:
    diag = getattr(error.orig, "diag", None)
    if getattr(diag, "constraint_name", None) == "dieta_nombre_dieta_key":
        raise AppError(409, "DIETA_DUPLICADA", "Ya existe una dieta con ese nombre.")