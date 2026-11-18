from __future__ import annotations

from collections.abc import Iterable, Mapping

from sqlalchemy import text
from sqlalchemy.engine import Connection
from sqlalchemy.exc import IntegrityError

from app.core.errors import AppError, sin_permiso

from app.services import dieta_service
from app.services.menu_generator import (
    CandidatoAlimento,
    InternalGenerationError,
    InvalidGenerationParamsError,
    MenuGenerado,
    MenuGenerationError,
    NotEnoughFoodsError,
    ParametrosGeneracion,
    RestriccionDieta,
    RestrictionViolationError,
    generate_menu,
)


_SELECT_CANDIDATOS = text("""
    SELECT a.id_alimento, a.nombre_alimento, a.tipo_preparacion,
           a.nivel_calorico, a.estado, a.id_grupo_nutricional
    FROM alimento AS a
    JOIN dieta_grupo AS dg
      ON dg.id_grupo_nutricional = a.id_grupo_nutricional
     AND dg.id_dieta = :id_dieta
    WHERE a.estado = 'guardado'
    ORDER BY a.id_alimento
""")

_SELECT_RESTRICCIONES = text("""
    SELECT id_alimento, cantidad_minima, cantidad_maxima
    FROM dieta_alimento
    WHERE id_dieta = :id_dieta
    ORDER BY id_alimento
""")

_SELECT_GRUPOS_DIETA = text("""
    SELECT id_grupo_nutricional
    FROM dieta_grupo
    WHERE id_dieta = :id_dieta
    ORDER BY id_grupo_nutricional
""")


def fetch_candidates(db: Connection, id_dieta: int) -> list[CandidatoAlimento]:
    """Obtiene los alimentos guardados disponibles para una dieta."""
    filas = db.execute(_SELECT_CANDIDATOS, {"id_dieta": id_dieta}).mappings().all()
    return [CandidatoAlimento(
        id_alimento=int(fila["id_alimento"]),
        nombre_alimento=str(fila["nombre_alimento"]),
        tipo_preparacion=fila["tipo_preparacion"],
        nivel_calorico=fila["nivel_calorico"],
        estado=fila["estado"],
        id_grupo=int(fila["id_grupo_nutricional"]),
    ) for fila in filas]


def fetch_restrictions(db: Connection, id_dieta: int) -> list[RestriccionDieta]:
    """Obtiene las restricciones de alimentos de una dieta."""
    filas = db.execute(_SELECT_RESTRICCIONES, {"id_dieta": id_dieta}).mappings().all()
    return [RestriccionDieta(
        id_alimento=int(fila["id_alimento"]),
        cantidad_minima=int(fila["cantidad_minima"]),
        cantidad_maxima=int(fila["cantidad_maxima"]),
    ) for fila in filas]


def fetch_diet_groups(db: Connection, id_dieta: int) -> tuple[int, ...]:
    """Obtiene los grupos nutricionales cubiertos por una dieta."""
    filas = db.execute(_SELECT_GRUPOS_DIETA, {"id_dieta": id_dieta}).scalars().all()
    return tuple(int(id_grupo) for id_grupo in filas)


def generate_menu_for_diet(
    db: Connection,
    id_dieta: int,
    cantidad_total_alimentos: int,
    proporciones: Mapping[str, int],
    grupos_requeridos: Iterable[int] | None = None,
    semilla: int | None = None,
) -> MenuGenerado:
    """Carga datos de PostgreSQL y genera un menú para una dieta."""

    grupos = tuple(
        fetch_diet_groups(db, id_dieta)
        if grupos_requeridos is None
        else grupos_requeridos
    )
    parametros = ParametrosGeneracion(
        cantidad_total_alimentos=cantidad_total_alimentos,
        proporciones=dict(proporciones),
        grupos_requeridos=grupos,
    )
    candidatos = fetch_candidates(db, id_dieta)
    restricciones = fetch_restrictions(db, id_dieta)
    return generate_menu(candidatos, restricciones, parametros, semilla)


def _diet_exists(db: Connection, id_dieta: int) -> bool:
    """Comprueba que la dieta exista."""
    return db.execute(
        text("SELECT EXISTS (SELECT 1 FROM dieta WHERE id_dieta = :id_dieta)"),
        {"id_dieta": id_dieta},
    ).scalar_one()


def _check_food_ids(db: Connection, ids_alimentos: list[int]) -> None:
    """Valida que todos los alimentos existan."""
    if not ids_alimentos:
        raise AppError(422, "DATOS_INVALIDOS", "Debe indicar al menos un alimento.", {"ids_alimentos": "Lista vacía."})
    existentes = db.execute(text("""
        SELECT id_alimento FROM alimento
        WHERE id_alimento = ANY(CAST(:ids AS INTEGER[]))
    """), {"ids": ids_alimentos}).scalars().all()
    faltantes = sorted(set(ids_alimentos) - set(existentes))
    if faltantes:
        raise AppError(422, "DATOS_INVALIDOS", "Revise los campos marcados.", {"ids_alimentos": f"No existen: {faltantes}"})


def _check_group_ids(db: Connection, ids_grupos: list[int], id_dieta: int) -> None:
    """Valida que los grupos existan y sean cubiertos por la dieta."""
    if not ids_grupos:
        return
    existentes = db.execute(text("""
        SELECT dg.id_grupo_nutricional
        FROM dieta_grupo dg
        WHERE dg.id_dieta = :id_dieta
          AND dg.id_grupo_nutricional = ANY(CAST(:ids AS INTEGER[]))
    """), {"id_dieta": id_dieta, "ids": ids_grupos}).scalars().all()
    faltantes = sorted(set(ids_grupos) - set(existentes))
    if faltantes:
        raise AppError(422, "DATOS_INVALIDOS", "Revise los campos marcados.", {"grupos_requeridos": f"No pertenecen a la dieta: {faltantes}"})


def _get_menu_row(db: Connection, id_menu: int) -> dict | None:
    """Obtiene la fila base de un menú."""
    fila = db.execute(text("""
        SELECT m.id_menu, m.nombre_menu, m.id_dieta, m.id_creador,
               uc.nombre AS nombre_creador, m.fecha_creacion, m.estado,
               m.origen, m.id_jefe_indica, m.cantidad_total_alimentos
        FROM menu m
        JOIN usuario uc ON uc.id_usuario = m.id_creador
        WHERE m.id_menu = :id_menu
    """), {"id_menu": id_menu}).mappings().first()
    return dict(fila) if fila else None


def _get_menu_detail(db: Connection, id_menu: int) -> dict:
    """Construye la respuesta detallada de un menú."""
    menu = _get_menu_row(db, id_menu)
    if menu is None:
        raise AppError(404, "NO_ENCONTRADO", "El menú no existe.")

    proporciones = db.execute(text("""
        SELECT tipo_preparacion, proporcion
        FROM proporcion_menu
        WHERE id_menu = :id_menu
        ORDER BY tipo_preparacion
    """), {"id_menu": id_menu}).mappings().all()
    grupos = db.execute(text("""
        SELECT g.id_grupo_nutricional, g.nombre_grupo
        FROM menu_grupo mg
        JOIN grupo_nutricional g ON g.id_grupo_nutricional = mg.id_grupo_nutricional
        WHERE mg.id_menu = :id_menu
        ORDER BY g.nombre_grupo
    """), {"id_menu": id_menu}).mappings().all()
    alimentos = db.execute(text("""
        SELECT a.id_alimento, a.nombre_alimento, a.tipo_preparacion, a.nivel_calorico
        FROM menu_alimento ma
        JOIN alimento a ON a.id_alimento = ma.id_alimento
        WHERE ma.id_menu = :id_menu
        ORDER BY a.id_alimento
    """), {"id_menu": id_menu}).mappings().all()
    revisiones = db.execute(text("""
        SELECT r.id_menu, r.num_revision, r.id_jefe,
               uj.nombre AS nombre_jefe, r.fecha_revision,
               r.resultado, r.observaciones
        FROM revision_menu r
        JOIN usuario uj ON uj.id_usuario = r.id_jefe
        WHERE r.id_menu = :id_menu
        ORDER BY r.num_revision
    """), {"id_menu": id_menu}).mappings().all()

    menu["creador"] = {
        "id_usuario": menu["id_creador"],
        "nombre": menu.pop("nombre_creador"),
    }
    menu["proporciones"] = [dict(fila) for fila in proporciones]
    menu["grupos_requeridos"] = [dict(fila) for fila in grupos]
    menu["alimentos"] = [dict(fila) for fila in alimentos]
    menu["revisiones"] = [{
        "id_menu": revision["id_menu"],
        "num_revision": revision["num_revision"],
        "id_jefe": revision["id_jefe"],
        "jefe": {"id_usuario": revision["id_jefe"], "nombre": revision["nombre_jefe"]},
        "fecha_revision": revision["fecha_revision"],
        "resultado": revision["resultado"],
        "observaciones": revision["observaciones"],
    } for revision in revisiones]
    return menu


def _insert_composition(db: Connection, id_menu: int, ids_alimentos: Iterable[int]) -> None:
    """Inserta los alimentos del menú."""
    db.execute(text("""
        INSERT INTO menu_alimento (id_menu, id_alimento)
        VALUES (:id_menu, :id_alimento)
    """), [{"id_menu": id_menu, "id_alimento": id_alimento} for id_alimento in ids_alimentos])


def _replace_composition(db: Connection, id_menu: int, ids_alimentos: list[int]) -> None:
    """Reemplaza los alimentos del menú."""
    db.execute(text("DELETE FROM menu_alimento WHERE id_menu = :id_menu"), {"id_menu": id_menu})
    _insert_composition(db, id_menu, ids_alimentos)


def _insert_parameters(
    db: Connection,
    id_menu: int,
    cantidad_total_alimentos: int,
    proporciones: Mapping[str, int],
    grupos_requeridos: Iterable[int],
) -> None:
    """Inserta los parámetros de generación de un menú automático."""
    db.execute(text("""
        INSERT INTO proporcion_menu (id_menu, tipo_preparacion, proporcion)
        VALUES (:id_menu, CAST(:tipo AS tipo_preparacion), :proporcion)
    """), [
        {"id_menu": id_menu, "tipo": tipo, "proporcion": proporcion}
        for tipo, proporcion in proporciones.items()
    ])
    db.execute(text("""
        INSERT INTO menu_grupo (id_menu, id_grupo_nutricional)
        VALUES (:id_menu, :id_grupo)
    """), [
        {"id_menu": id_menu, "id_grupo": id_grupo}
        for id_grupo in grupos_requeridos
    ])


def _replace_parameters(
    db: Connection,
    id_menu: int,
    cantidad_total_alimentos: int,
    proporciones: Mapping[str, int],
    grupos_requeridos: Iterable[int],
) -> None:
    """Reemplaza los parámetros de generación de un menú automático."""
    db.execute(text("""
        UPDATE menu
        SET cantidad_total_alimentos = :cantidad
        WHERE id_menu = :id_menu
    """), {"id_menu": id_menu, "cantidad": cantidad_total_alimentos})
    db.execute(text("DELETE FROM proporcion_menu WHERE id_menu = :id_menu"), {"id_menu": id_menu})
    db.execute(text("DELETE FROM menu_grupo WHERE id_menu = :id_menu"), {"id_menu": id_menu})
    _insert_parameters(db, id_menu, cantidad_total_alimentos, proporciones, grupos_requeridos)


def _translate_generation_error(error: MenuGenerationError) -> AppError:
    """Convierte un error del generador en un error de negocio."""
    if isinstance(error, InvalidGenerationParamsError):
        return AppError(422, "PARAMETROS_MENU_INVALIDOS", str(error))
    if isinstance(error, NotEnoughFoodsError):
        return AppError(422, "ALIMENTOS_INSUFICIENTES", str(error))
    if isinstance(error, RestrictionViolationError):
        return AppError(422, "RESTRICCION_DIETA_VIOLADA", str(error))
    if isinstance(error, InternalGenerationError):
        return AppError(500, "ERROR_GENERACION_MENU", str(error))
    return AppError(500, "ERROR_GENERACION_MENU", "No se pudo generar el menú.")


def create_automatic_menu(
    db: Connection,
    user: dict,
    nombre_menu: str,
    id_dieta: int,
    cantidad_total_alimentos: int,
    proporciones: Mapping[str, int],
    grupos_requeridos: list[int],
) -> dict:
    """Crea un menú automático en borrador para una dieta atendida."""
    if not _diet_exists(db, id_dieta):
        raise AppError(404, "NO_ENCONTRADO", "La dieta no existe.")
    if not dieta_service.nutritionist_attends_diet(db, user["id_usuario"], id_dieta):
        raise sin_permiso()
    grupos = tuple(grupos_requeridos) if grupos_requeridos else tuple(fetch_diet_groups(db, id_dieta))
    _check_group_ids(db, list(grupos), id_dieta)

    try:
        generado = generate_menu_for_diet(
            db,
            id_dieta,
            cantidad_total_alimentos,
            dict(proporciones),
            grupos,
        )
    except MenuGenerationError as error:
        raise _translate_generation_error(error) from None

    try:
        fila = db.execute(text("""
            INSERT INTO menu (
                nombre_menu, id_dieta, id_creador, estado, origen,
                id_jefe_indica, cantidad_total_alimentos
            )
            VALUES (
                :nombre_menu, :id_dieta, :id_creador, 'borrador', 'automatico',
                NULL, :cantidad_total_alimentos
            )
            RETURNING id_menu
        """), {
            "nombre_menu": nombre_menu.strip(),
            "id_dieta": id_dieta,
            "id_creador": user["id_usuario"],
            "cantidad_total_alimentos": cantidad_total_alimentos,
        }).scalar_one()
        _insert_parameters(db, fila, cantidad_total_alimentos, proporciones, grupos)
        _insert_composition(db, fila, generado.ids_alimentos)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AppError(409, "MENU_DUPLICADO", "No se pudo crear el menú.")
    except Exception:
        db.rollback()
        raise
    return _get_menu_detail(db, fila)


def create_manual_menu(
    db: Connection,
    user: dict,
    nombre_menu: str,
    id_dieta: int,
    ids_alimentos: list[int],
) -> dict:
    """Crea un menú manual indicado por el jefe."""
    if user["rol"] != "jefe":
        raise sin_permiso()
    if not _diet_exists(db, id_dieta):
        raise AppError(404, "NO_ENCONTRADO", "La dieta no existe.")
    _check_food_ids(db, ids_alimentos)

    try:
        fila = db.execute(text("""
            INSERT INTO menu (
                nombre_menu, id_dieta, id_creador, estado, origen,
                id_jefe_indica, cantidad_total_alimentos
            )
            VALUES (
                :nombre_menu, :id_dieta, :id_creador, 'borrador', 'manual',
                :id_jefe, NULL
            )
            RETURNING id_menu
        """), {
            "nombre_menu": nombre_menu.strip(),
            "id_dieta": id_dieta,
            "id_creador": user["id_usuario"],
            "id_jefe": user["id_usuario"],
        }).scalar_one()
        _insert_composition(db, fila, ids_alimentos)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AppError(409, "MENU_DUPLICADO", "No se pudo crear el menú.")
    except Exception:
        db.rollback()
        raise
    return _get_menu_detail(db, fila)


def update_menu(
    db: Connection,
    id_menu: int,
    user: dict,
    nombre_menu: str | None = None,
    ids_alimentos: list[int] | None = None,
    cantidad_total_alimentos: int | None = None,
    proporciones: Mapping[str, int] | None = None,
    grupos_requeridos: list[int] | None = None,
) -> dict:
    """Edita un menú en borrador con su nombre, composición o parámetros."""
    menu = _get_menu_row(db, id_menu)
    if menu is None:
        raise AppError(404, "NO_ENCONTRADO", "El menú no existe.")
    if menu["estado"] != "borrador":
        raise AppError(409, "MENU_NO_BORRADOR", "Solo se pueden editar menús en borrador.")
    if user["rol"] != "jefe" and menu["id_creador"] != user["id_usuario"]:
        raise sin_permiso()

    try:
        db.execute(text("SELECT 1 FROM menu WHERE id_menu = :id_menu FOR UPDATE"), {"id_menu": id_menu})
        if nombre_menu is not None:
            db.execute(text("""
                UPDATE menu SET nombre_menu = :nombre_menu WHERE id_menu = :id_menu
            """), {"id_menu": id_menu, "nombre_menu": nombre_menu.strip()})

        if ids_alimentos is not None:
            if menu["origen"] != "manual":
                raise AppError(422, "DATOS_INVALIDOS", "Un menú automático no se actualiza por ids_alimentos.")
            _check_food_ids(db, ids_alimentos)
            _replace_composition(db, id_menu, ids_alimentos)

        if cantidad_total_alimentos is not None or proporciones is not None or grupos_requeridos is not None:
            if menu["origen"] != "automatico":
                raise AppError(422, "DATOS_INVALIDOS", "Un menú manual no admite parámetros automáticos.")
            if cantidad_total_alimentos is None or proporciones is None:
                raise AppError(422, "DATOS_INVALIDOS", "Los parámetros automáticos deben enviarse juntos.")
            grupos = tuple(grupos_requeridos) if grupos_requeridos is not None else tuple(fetch_diet_groups(db, menu["id_dieta"]))
            _check_group_ids(db, list(grupos), menu["id_dieta"])
            generado = generate_menu_for_diet(
                db,
                menu["id_dieta"],
                cantidad_total_alimentos,
                dict(proporciones),
                grupos,
            )
            _replace_parameters(db, id_menu, cantidad_total_alimentos, proporciones, grupos)
            _replace_composition(db, id_menu, list(generado.ids_alimentos))
        db.commit()
    except MenuGenerationError as error:
        db.rollback()
        raise _translate_generation_error(error) from None
    except Exception:
        db.rollback()
        raise
    return _get_menu_detail(db, id_menu)


def delete_menu(db: Connection, id_menu: int, user: dict) -> None:
    """Elimina un menú en borrador y su composición."""
    menu = _get_menu_row(db, id_menu)
    if menu is None:
        raise AppError(404, "NO_ENCONTRADO", "El menú no existe.")
    if menu["estado"] != "borrador":
        raise AppError(409, "MENU_NO_BORRADOR", "Solo se pueden eliminar menús en borrador.")
    if user["rol"] != "jefe" and menu["id_creador"] != user["id_usuario"]:
        raise sin_permiso()

    try:
        db.execute(text("DELETE FROM menu WHERE id_menu = :id_menu"), {"id_menu": id_menu})
        db.commit()
    except Exception:
        db.rollback()
        raise


def send_menu_to_review(db: Connection, id_menu: int, user: dict) -> dict:
    """Envía un menú borrador o corregido a revisión."""
    menu = _get_menu_row(db, id_menu)
    if menu is None:
        raise AppError(404, "NO_ENCONTRADO", "El menú no existe.")
    if menu["estado"] not in ("borrador", "rechazado"):
        raise AppError(409, "MENU_NO_REENVIABLE", "Solo se puede enviar a revisión un menú en borrador o rechazado.")
    if user["rol"] != "jefe" and menu["id_creador"] != user["id_usuario"]:
        raise sin_permiso()

    db.execute(text("""
        UPDATE menu SET estado = 'pendiente'
        WHERE id_menu = :id_menu
          AND estado IN ('borrador', 'rechazado')
    """), {"id_menu": id_menu})
    db.commit()
    return _get_menu_detail(db, id_menu)


def list_menus(db: Connection, user: dict, id_dieta: int | None = None, estado: str | None = None) -> list[dict]:
    """Lista menús accesibles al usuario, incluyendo otros nutricionistas de la dieta."""
    if id_dieta is not None:
        if not _diet_exists(db, id_dieta):
            raise AppError(404, "NO_ENCONTRADO", "La dieta no existe.")
        if not dieta_service.nutritionist_attends_diet(db, user["id_usuario"], id_dieta):
            raise sin_permiso()

    where = ""
    params: dict = {"estado": estado, "id_dieta": id_dieta}
    if id_dieta is not None:
        where = "AND m.id_dieta = :id_dieta"
    elif user["rol"] != "jefe":
        where = """
          AND (EXISTS (
                SELECT 1 FROM nutricionista_dieta nd
                WHERE nd.id_nutricionista = :id_usuario AND nd.id_dieta = m.id_dieta
              ) OR m.id_creador = :id_usuario)
        """
        params["id_usuario"] = user["id_usuario"]

    filas = db.execute(text(f"""
        SELECT m.id_menu, m.nombre_menu, m.id_dieta, m.id_creador,
               uc.nombre AS nombre_creador, m.fecha_creacion, m.estado, m.origen
        FROM menu m
        JOIN usuario uc ON uc.id_usuario = m.id_creador
        WHERE (:estado IS NULL OR m.estado = CAST(:estado AS estado_menu))
          {where}
        ORDER BY m.fecha_creacion DESC, m.id_menu DESC
    """), params).mappings().all()

    return [{
        **dict(fila),
        "creador": {"id_usuario": fila["id_creador"], "nombre": fila["nombre_creador"]},
    } for fila in filas]


def get_menu(db: Connection, id_menu: int, user: dict) -> dict:
    """Obtiene un menú si el usuario atiende su dieta o es jefe."""
    menu = _get_menu_row(db, id_menu)
    if menu is None:
        raise AppError(404, "NO_ENCONTRADO", "El menú no existe.")
    if user["rol"] != "jefe":
        if not dieta_service.nutritionist_attends_diet(db, user["id_usuario"], menu["id_dieta"]):
            raise sin_permiso()
    return _get_menu_detail(db, id_menu)
