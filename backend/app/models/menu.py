from __future__ import annotations

from collections.abc import Iterable, Mapping
from decimal import Decimal
from typing import Any

from sqlalchemy import text
from sqlalchemy.engine import Connection


_INSERT_MENU = text("""
    INSERT INTO menu (
        nombre_menu, id_dieta, id_creador, estado, origen,
        id_jefe_indica, cantidad_total_alimentos
    )
    VALUES (
        :nombre_menu, :id_dieta, :id_creador,
        CAST(:estado AS estado_menu), CAST(:origen AS origen_menu),
        :id_jefe_indica, :cantidad_total_alimentos
    )
    RETURNING id_menu
""")

_INSERT_MENU_ALIMENTO = text("""
    INSERT INTO menu_alimento (id_menu, id_alimento)
    VALUES (:id_menu, :id_alimento)
""")

_INSERT_PROPORCION = text("""
    INSERT INTO proporcion_menu (id_menu, tipo_preparacion, proporcion)
    VALUES (:id_menu, CAST(:tipo_preparacion AS tipo_preparacion), :proporcion)
""")

_INSERT_MENU_GRUPO = text("""
    INSERT INTO menu_grupo (id_menu, id_grupo_nutricional)
    VALUES (:id_menu, :id_grupo_nutricional)
""")


def _insert_composicion(
    db: Connection,
    id_menu: int,
    alimentos: Iterable[int],
    proporciones: Mapping[str, int | Decimal] | None,
    grupos_requeridos: Iterable[int],
) -> None:
    alimentos_ids = list(dict.fromkeys(int(value) for value in alimentos))
    if alimentos_ids:
        db.execute(
            _INSERT_MENU_ALIMENTO,
            [{"id_menu": id_menu, "id_alimento": value} for value in alimentos_ids],
        )

    if proporciones:
        db.execute(
            _INSERT_PROPORCION,
            [
                {"id_menu": id_menu, "tipo_preparacion": tipo, "proporcion": proporcion}
                for tipo, proporcion in proporciones.items()
            ],
        )

    grupos_ids = list(dict.fromkeys(int(value) for value in grupos_requeridos))
    if grupos_ids:
        db.execute(
            _INSERT_MENU_GRUPO,
            [{"id_menu": id_menu, "id_grupo_nutricional": value} for value in grupos_ids],
        )


def insert_menu(
    db: Connection,
    nombre_menu: str,
    id_dieta: int,
    id_creador: int,
    estado: str = "borrador",
    origen: str = "manual",
    id_jefe_indica: int | None = None,
    cantidad_total_alimentos: int | None = None,
    alimentos: Iterable[int] = (),
    proporciones: Mapping[str, int | Decimal] | None = None,
    grupos_requeridos: Iterable[int] = (),
) -> int:
    fila = db.execute(
        _INSERT_MENU,
        {
            "nombre_menu": nombre_menu.strip(),
            "id_dieta": id_dieta,
            "id_creador": id_creador,
            "estado": estado,
            "origen": origen,
            "id_jefe_indica": id_jefe_indica,
            "cantidad_total_alimentos": cantidad_total_alimentos,
        },
    ).mappings().one()
    id_menu = int(fila["id_menu"])
    _insert_composicion(db, id_menu, alimentos, proporciones, grupos_requeridos)
    return id_menu


_GET_MENU = text("""
    SELECT m.id_menu, m.nombre_menu, m.id_dieta, d.nombre_dieta,
           m.id_creador, uc.nombre AS nombre_creador,
           n.especialidad, m.fecha_creacion, m.estado, m.origen,
           m.id_jefe_indica, m.cantidad_total_alimentos
    FROM menu m
    JOIN dieta d ON d.id_dieta = m.id_dieta
    JOIN usuario uc ON uc.id_usuario = m.id_creador
    LEFT JOIN nutricionista n ON n.id_usuario = m.id_creador
    WHERE m.id_menu = :id_menu
""")

_GET_MENU_ALIMENTOS = text("""
    SELECT a.id_alimento, a.nombre_alimento, a.tipo_preparacion,
           a.nivel_calorico, a.estado, a.id_grupo_nutricional,
           g.nombre_grupo
    FROM menu_alimento ma
    JOIN alimento a ON a.id_alimento = ma.id_alimento
    JOIN grupo_nutricional g ON g.id_grupo_nutricional = a.id_grupo_nutricional
    WHERE ma.id_menu = :id_menu
    ORDER BY a.id_alimento
""")

_GET_PROPORCIONES = text("""
    SELECT tipo_preparacion, proporcion
    FROM proporcion_menu
    WHERE id_menu = :id_menu
    ORDER BY tipo_preparacion
""")

_GET_MENU_GRUPOS = text("""
    SELECT g.id_grupo_nutricional, g.nombre_grupo, g.descripcion
    FROM menu_grupo mg
    JOIN grupo_nutricional g ON g.id_grupo_nutricional = mg.id_grupo_nutricional
    WHERE mg.id_menu = :id_menu
    ORDER BY g.id_grupo_nutricional
""")


def get_menu(db: Connection, id_menu: int) -> dict[str, Any] | None:
    fila = db.execute(_GET_MENU, {"id_menu": id_menu}).mappings().first()
    if fila is None:
        return None

    menu = dict(fila)
    menu["creador"] = {
        "id_usuario": menu["id_creador"],
        "nombre": menu.pop("nombre_creador"),
        "especialidad": menu.pop("especialidad"),
    }
    menu["alimentos"] = [dict(row) for row in db.execute(_GET_MENU_ALIMENTOS, {"id_menu": id_menu}).mappings()]
    menu["proporciones"] = [dict(row) for row in db.execute(_GET_PROPORCIONES, {"id_menu": id_menu}).mappings()]
    menu["grupos"] = [dict(row) for row in db.execute(_GET_MENU_GRUPOS, {"id_menu": id_menu}).mappings()]
    return menu


_LIST_MENUS_POR_DIETA = text("""
    SELECT m.id_menu, m.nombre_menu, m.id_creador, uc.nombre AS nombre_creador,
           n.especialidad, m.fecha_creacion, m.estado, m.origen
    FROM menu m
    JOIN usuario uc ON uc.id_usuario = m.id_creador
    LEFT JOIN nutricionista n ON n.id_usuario = m.id_creador
    WHERE m.id_dieta = :id_dieta
    ORDER BY m.fecha_creacion DESC, m.id_menu DESC
""")


def list_menus_by_diet(db: Connection, id_dieta: int) -> list[dict[str, Any]]:
    filas = db.execute(_LIST_MENUS_POR_DIETA, {"id_dieta": id_dieta}).mappings()
    return [dict(fila) for fila in filas]


_UPDATE_MENU = text("""
    UPDATE menu
    SET nombre_menu = :nombre_menu,
        cantidad_total_alimentos = :cantidad_total_alimentos
    WHERE id_menu = :id_menu
    RETURNING id_menu
""")

_DELETE_MENU_ALIMENTOS = text("DELETE FROM menu_alimento WHERE id_menu = :id_menu")
_DELETE_PROPORCIONES = text("DELETE FROM proporcion_menu WHERE id_menu = :id_menu")
_DELETE_MENU_GRUPOS = text("DELETE FROM menu_grupo WHERE id_menu = :id_menu")


def update_menu(
    db: Connection,
    id_menu: int,
    nombre_menu: str,
    cantidad_total_alimentos: int | None,
    alimentos: Iterable[int],
    proporciones: Mapping[str, int | Decimal] | None = None,
    grupos_requeridos: Iterable[int] = (),
) -> dict[str, Any] | None:
    bloqueada = db.execute(
        text("SELECT id_menu FROM menu WHERE id_menu = :id_menu FOR UPDATE"),
        {"id_menu": id_menu},
    ).first()
    if bloqueada is None:
        return None

    fila = db.execute(
        _UPDATE_MENU,
        {
            "id_menu": id_menu,
            "nombre_menu": nombre_menu.strip(),
            "cantidad_total_alimentos": cantidad_total_alimentos,
        },
    ).mappings().first()
    if fila is None:
        return None

    db.execute(_DELETE_MENU_ALIMENTOS, {"id_menu": id_menu})
    db.execute(_DELETE_PROPORCIONES, {"id_menu": id_menu})
    db.execute(_DELETE_MENU_GRUPOS, {"id_menu": id_menu})
    _insert_composicion(db, id_menu, alimentos, proporciones, grupos_requeridos)
    return get_menu(db, id_menu)


_DELETE_MENU_ROW = text("DELETE FROM menu WHERE id_menu = :id_menu RETURNING id_menu")


def delete_menu(db: Connection, id_menu: int) -> dict[str, int] | None:
    bloqueada = db.execute(
        text("SELECT id_menu FROM menu WHERE id_menu = :id_menu FOR UPDATE"),
        {"id_menu": id_menu},
    ).first()
    if bloqueada is None:
        return None
    fila = db.execute(_DELETE_MENU_ROW, {"id_menu": id_menu}).mappings().first()
    return dict(fila) if fila else None


_CHANGE_STATE = text("""
    UPDATE menu
    SET estado = CAST(:estado AS estado_menu)
    WHERE id_menu = :id_menu
    RETURNING id_menu, estado
""")


def change_state(db: Connection, id_menu: int, estado: str) -> dict[str, Any] | None:
    fila = db.execute(
        _CHANGE_STATE,
        {"id_menu": id_menu, "estado": estado},
    ).mappings().first()
    return dict(fila) if fila else None


_GET_NEXT_NUM_REVISION = text("""
    SELECT COALESCE(MAX(num_revision), 0) + 1 AS num_revision
    FROM revision_menu
    WHERE id_menu = :id_menu
""")


def get_next_num_revision(db: Connection, id_menu: int) -> int:
    fila = db.execute(_GET_NEXT_NUM_REVISION, {"id_menu": id_menu}).mappings().one()
    return int(fila["num_revision"])


_INSERT_REVISION = text("""
    INSERT INTO revision_menu (id_menu, num_revision, id_jefe, resultado, observaciones)
    VALUES (
        :id_menu, :num_revision, :id_jefe,
        CAST(:resultado AS resultado_revision), :observaciones
    )
    RETURNING id_menu, num_revision, id_jefe, fecha_revision, resultado, observaciones
""")


def insert_review(
    db: Connection,
    id_menu: int,
    id_jefe: int,
    resultado: str,
    observaciones: str | None = None,
) -> dict[str, Any]:
    bloqueada = db.execute(
        text("SELECT id_menu FROM menu WHERE id_menu = :id_menu FOR UPDATE"),
        {"id_menu": id_menu},
    ).first()
    if bloqueada is None:
        raise LookupError("El menú no existe")

    num_revision = get_next_num_revision(db, id_menu)
    fila = db.execute(
        _INSERT_REVISION,
        {
            "id_menu": id_menu,
            "num_revision": num_revision,
            "id_jefe": id_jefe,
            "resultado": resultado,
            "observaciones": observaciones,
        },
    ).mappings().one()
    return dict(fila)


_LIST_REVISIONS = text("""
    SELECT r.id_menu, r.num_revision, r.id_jefe, u.nombre AS nombre_jefe,
           r.fecha_revision, r.resultado, r.observaciones
    FROM revision_menu r
    JOIN usuario u ON u.id_usuario = r.id_jefe
    WHERE r.id_menu = :id_menu
    ORDER BY r.num_revision
""")


def list_review_history(db: Connection, id_menu: int) -> list[dict[str, Any]]:
    filas = db.execute(_LIST_REVISIONS, {"id_menu": id_menu}).mappings()
    return [dict(fila) for fila in filas]
