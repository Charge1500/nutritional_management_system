from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import IntegrityError

from app.core.errors import AppError, sin_permiso
from app.services.name_similarity import find_similar_pairs

_FOOD_COLUMNS = """
    a.id_alimento, a.nombre_alimento,
    CASE WHEN pc.id_alimento IS NOT NULL THEN 'compuesto' ELSE 'simple' END AS tipo_alimento,
    a.tipo_preparacion, a.nivel_calorico, a.estado, a.fecha_creacion,
    a.id_grupo_nutricional, a.id_creador
"""
_FOOD_FROM = "FROM alimento a LEFT JOIN plato_compuesto pc ON pc.id_alimento = a.id_alimento"


def list_foods(
    db: Connection,
    state: str | None = None,
    group_id: int | None = None,
    preparation_type: str | None = None,
    calorie_level: str | None = None,
) -> list[dict]:
    sql = f"""
    SELECT {_FOOD_COLUMNS}
    {_FOOD_FROM}
    WHERE (CAST(:state AS estado_catalogo) IS NULL OR a.estado = CAST(:state AS estado_catalogo))
      AND (CAST(:group_id AS INTEGER) IS NULL OR a.id_grupo_nutricional = CAST(:group_id AS INTEGER))
      AND (CAST(:preparation AS tipo_preparacion) IS NULL
           OR a.tipo_preparacion = CAST(:preparation AS tipo_preparacion))
      AND (CAST(:level AS nivel_calorico) IS NULL OR a.nivel_calorico = CAST(:level AS nivel_calorico))
    ORDER BY a.nombre_alimento
    """
    params = {"state": state, "group_id": group_id, "preparation": preparation_type, "level": calorie_level}
    return [dict(row) for row in db.execute(text(sql), params).mappings().all()]


def get_food(db: Connection, food_id: int) -> dict | None:
    """Alimento con su grupo, su creador y sus ingredientes, o None si no existe."""
    sql = f"""
    SELECT {_FOOD_COLUMNS}, g.nombre_grupo, u.nombre AS nombre_creador
    {_FOOD_FROM}
    JOIN grupo_nutricional g ON g.id_grupo_nutricional = a.id_grupo_nutricional
    JOIN usuario u ON u.id_usuario = a.id_creador
    WHERE a.id_alimento = :food_id
    """
    row = db.execute(text(sql), {"food_id": food_id}).mappings().first()
    if row is None:
        return None

    ingredients = db.execute(
        text(
            """
            SELECT i.id_alimento, i.nombre_alimento
            FROM plato_ingrediente pi
            JOIN alimento i ON i.id_alimento = pi.id_ingrediente
            WHERE pi.id_plato = :food_id
            ORDER BY i.nombre_alimento
            """
        ),
        {"food_id": food_id},
    ).mappings().all()

    food = dict(row)
    group_name = food.pop("nombre_grupo")
    creator_name = food.pop("nombre_creador")
    food["grupo"] = {"id_grupo_nutricional": food["id_grupo_nutricional"], "nombre_grupo": group_name}
    food["creador"] = {"id_usuario": food["id_creador"], "nombre": creator_name}
    food["ingredientes"] = [dict(ingredient) for ingredient in ingredients]
    food["ficha"] = None  # se completa en la rama de la ficha nutricional (MongoDB)
    return food


def create_food(
    db: Connection,
    creator_id: int,
    name: str,
    food_type: str,
    preparation_type: str,
    calorie_level: str,
    state: str,
    group_id: int,
    ingredient_ids: list[int],
) -> dict:
    try:
        _check_group_exists(db, group_id)
        if food_type == "compuesto":
            _check_ingredients(db, ingredient_ids)
        food_id = db.execute(
            text(
                """
                INSERT INTO alimento (nombre_alimento, tipo_preparacion, nivel_calorico, estado,
                                      id_grupo_nutricional, id_creador)
                VALUES (:name, CAST(:preparation AS tipo_preparacion), CAST(:level AS nivel_calorico),
                        CAST(:state AS estado_catalogo), :group_id, :creator_id)
                RETURNING id_alimento
                """
            ),
            {
                "name": name.strip(),
                "preparation": preparation_type,
                "level": calorie_level,
                "state": state,
                "group_id": group_id,
                "creator_id": creator_id,
            },
        ).scalar_one()
        _insert_type_rows(db, food_id, food_type, ingredient_ids)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        _raise_if_duplicate_name(error)
        raise
    except Exception:
        db.rollback()
        raise
    return get_food(db, food_id)


def update_food(
    db: Connection,
    food_id: int,
    user_id: int,
    name: str,
    food_type: str,
    preparation_type: str,
    calorie_level: str,
    state: str,
    group_id: int,
    ingredient_ids: list[int],
) -> dict | None:
    try:
        current = db.execute(
            text(
                """
                SELECT a.id_creador, (pc.id_alimento IS NOT NULL) AS is_compound
                FROM alimento a LEFT JOIN plato_compuesto pc ON pc.id_alimento = a.id_alimento
                WHERE a.id_alimento = :food_id
                FOR UPDATE OF a
                """
            ),
            {"food_id": food_id},
        ).first()
        if current is None:
            db.rollback()
            return None
        creator_id, is_compound = current
        if creator_id != user_id:
            raise sin_permiso()  # solo quien creó el alimento lo edita
        if (food_type == "compuesto") != is_compound:
            raise AppError(
                422, "DATOS_INVALIDOS", "Revise los campos marcados.",
                {"tipo_alimento": "No se puede cambiar el tipo de un alimento existente."},
            )
        _check_group_exists(db, group_id)
        if is_compound:
            _check_ingredients(db, ingredient_ids)
        db.execute(
            text(
                """
                UPDATE alimento
                SET nombre_alimento = :name, tipo_preparacion = CAST(:preparation AS tipo_preparacion),
                    nivel_calorico = CAST(:level AS nivel_calorico), estado = CAST(:state AS estado_catalogo),
                    id_grupo_nutricional = :group_id
                WHERE id_alimento = :food_id
                """
            ),
            {
                "food_id": food_id,
                "name": name.strip(),
                "preparation": preparation_type,
                "level": calorie_level,
                "state": state,
                "group_id": group_id,
            },
        )
        if is_compound:
            db.execute(text("DELETE FROM plato_ingrediente WHERE id_plato = :food_id"), {"food_id": food_id})
            _insert_ingredients(db, food_id, ingredient_ids)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        _raise_if_duplicate_name(error)
        raise
    except Exception:
        db.rollback()
        raise
    return get_food(db, food_id)


def delete_food(db: Connection, food_id: int) -> bool:
    try:
        deleted = db.execute(
            text("DELETE FROM alimento WHERE id_alimento = :food_id RETURNING id_alimento"), {"food_id": food_id}
        ).first()
        db.commit()
    except IntegrityError as error:
        db.rollback()
        if getattr(error.orig, "sqlstate", None) == "23503":  # foreign_key_violation: hay filas que lo usan
            raise AppError(
                409, "ALIMENTO_EN_USO",
                "El alimento está en uso (menús, dietas, platos o consumos) y no se puede eliminar.",
            )
        raise
    return deleted is not None


def find_possible_duplicates(db: Connection) -> list[dict]:
    rows = db.execute(text("SELECT id_alimento, nombre_alimento FROM alimento ORDER BY id_alimento")).mappings().all()
    return find_similar_pairs([dict(row) for row in rows])


# ------------------------------------------------------------- auxiliares
def _check_group_exists(db: Connection, group_id: int) -> None:
    found = db.execute(
        text("SELECT 1 FROM grupo_nutricional WHERE id_grupo_nutricional = :group_id"), {"group_id": group_id}
    ).first()
    if found is None:
        raise AppError(
            422, "DATOS_INVALIDOS", "Revise los campos marcados.",
            {"id_grupo_nutricional": "El grupo nutricional no existe."},
        )


def _check_ingredients(db: Connection, ingredient_ids: list[int]) -> None:
    """Un plato necesita al menos un ingrediente y todos deben ser alimentos simples que existan."""
    if not ingredient_ids:
        raise AppError(
            422, "DATOS_INVALIDOS", "Revise los campos marcados.",
            {"ids_ingredientes": "Un plato compuesto necesita al menos un ingrediente."},
        )
    found = db.execute(
        text("SELECT id_alimento FROM alimento_simple WHERE id_alimento = ANY(CAST(:ids AS INTEGER[]))"),
        {"ids": list(ingredient_ids)},
    ).scalars().all()
    invalid = sorted(set(ingredient_ids) - set(found))
    if invalid:
        raise AppError(
            422, "DATOS_INVALIDOS", "Revise los campos marcados.",
            {"ids_ingredientes": f"Deben ser alimentos simples que existan. No válidos: {invalid}"},
        )


def _insert_type_rows(db: Connection, food_id: int, food_type: str, ingredient_ids: list[int]) -> None:
    if food_type == "simple":
        db.execute(text("INSERT INTO alimento_simple (id_alimento) VALUES (:food_id)"), {"food_id": food_id})
    else:
        db.execute(text("INSERT INTO plato_compuesto (id_alimento) VALUES (:food_id)"), {"food_id": food_id})
        _insert_ingredients(db, food_id, ingredient_ids)


def _insert_ingredients(db: Connection, food_id: int, ingredient_ids: list[int]) -> None:
    db.execute(
        text("INSERT INTO plato_ingrediente (id_plato, id_ingrediente) VALUES (:food_id, :ingredient_id)"),
        [{"food_id": food_id, "ingredient_id": ingredient_id} for ingredient_id in ingredient_ids],
    )


def _raise_if_duplicate_name(error: IntegrityError) -> None:
    diag = getattr(error.orig, "diag", None)
    if getattr(diag, "constraint_name", None) == "uq_alimento_nombre":
        raise AppError(409, "ALIMENTO_DUPLICADO", "Ya existe un alimento con ese nombre.")