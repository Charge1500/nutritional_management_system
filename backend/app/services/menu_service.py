from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any

from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.services.menu_generator import (
    CandidatoAlimento,
    MenuGenerado,
    ParametrosGeneracion,
    RestriccionDieta,
    generate_menu,
)


_SELECT_CANDIDATOS = text(
    """
    SELECT
        a.id_alimento,
        a.nombre_alimento,
        a.tipo_preparacion,
        a.nivel_calorico,
        a.estado,
        a.id_grupo_nutricional
    FROM alimento AS a
    JOIN dieta_grupo AS dg
      ON dg.id_grupo_nutricional = a.id_grupo_nutricional
     AND dg.id_dieta = :id_dieta
    WHERE a.estado = 'guardado'
    ORDER BY a.id_alimento
    """
)

_SELECT_RESTRICCIONES = text(
    """
    SELECT da.id_alimento, da.cantidad_minima, da.cantidad_maxima
    FROM dieta_alimento AS da
    WHERE da.id_dieta = :id_dieta
    ORDER BY da.id_alimento
    """
)

_SELECT_GRUPOS_DIETA = text(
    """
    SELECT dg.id_grupo_nutricional
    FROM dieta_grupo AS dg
    WHERE dg.id_dieta = :id_dieta
    ORDER BY dg.id_grupo_nutricional
    """
)


def _build_candidate(fila: Mapping[str, Any]) -> CandidatoAlimento:
    """Convierte una fila de ``alimento`` en un candidato del generador.

    Args:
        fila: Fila obtenida mediante ``Result.mappings()``.

    Returns:
        Candidato con los campos reales de la tabla ``alimento``.
    """

    return CandidatoAlimento(
        id_alimento=int(fila["id_alimento"]),
        nombre_alimento=str(fila["nombre_alimento"]),
        tipo_preparacion=fila["tipo_preparacion"],
        nivel_calorico=fila["nivel_calorico"],
        estado=fila["estado"],
        id_grupo=int(fila["id_grupo_nutricional"]),
    )


def _build_restriction(fila: Mapping[str, Any]) -> RestriccionDieta:
    """Convierte una fila de ``dieta_alimento`` en una restricción."""

    return RestriccionDieta(
        id_alimento=int(fila["id_alimento"]),
        cantidad_minima=int(fila["cantidad_minima"]),
        cantidad_maxima=int(fila["cantidad_maxima"]),
    )


def _fetch_candidates(
    db: Connection,
    id_dieta: int,
) -> list[CandidatoAlimento]:
    """Consulta los alimentos guardados de los grupos de una dieta."""

    filas = db.execute(_SELECT_CANDIDATOS, {"id_dieta": id_dieta}).mappings()
    return [_build_candidate(fila) for fila in filas]


def _fetch_restrictions(
    db: Connection,
    id_dieta: int,
) -> list[RestriccionDieta]:
    """Consulta las restricciones de alimentos de una dieta."""

    filas = db.execute(_SELECT_RESTRICCIONES, {"id_dieta": id_dieta}).mappings()
    return [_build_restriction(fila) for fila in filas]


def _fetch_diet_groups(db: Connection, id_dieta: int) -> tuple[int, ...]:
    """Consulta los grupos nutricionales asociados a una dieta."""

    filas = db.execute(_SELECT_GRUPOS_DIETA, {"id_dieta": id_dieta}).mappings()
    return tuple(int(fila["id_grupo_nutricional"]) for fila in filas)


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
        _fetch_diet_groups(db, id_dieta)
        if grupos_requeridos is None
        else grupos_requeridos
    )
    parametros = ParametrosGeneracion(
        cantidad_total_alimentos=cantidad_total_alimentos,
        proporciones=dict(proporciones),
        grupos_requeridos=grupos,
    )
    candidatos = _fetch_candidates(db, id_dieta)
    restricciones = _fetch_restrictions(db, id_dieta)
    return generate_menu(candidatos, restricciones, parametros, semilla)
