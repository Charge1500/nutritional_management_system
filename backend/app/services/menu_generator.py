from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from types import MappingProxyType
import random
from typing import Dict, Iterable, List, Literal, Mapping, Optional, Sequence, Set, Tuple


TipoPreparacion = Literal["entrante", "plato_fuerte", "postre", "bebida"]
NivelCalorico = Literal["bajo", "medio", "alto"]
EstadoCatalogo = Literal["borrador", "guardado"]

TIPOS_PREPARACION = frozenset(
    {"entrante", "plato_fuerte", "postre", "bebida"}
)
NIVELES_CALORICOS = frozenset({"bajo", "medio", "alto"})
ESTADOS_CATALOGO = frozenset({"borrador", "guardado"})
ESTADO_BORRADOR: EstadoCatalogo = "borrador"


# ---------------------------------------------------------------------------
# Excepciones
# ---------------------------------------------------------------------------
class MenuGenerationError(Exception):
    """Base de todos los errores de generación de menús."""


class InvalidGenerationParamsError(MenuGenerationError):
    """Parámetros de generación o restricciones mal formados."""

    def __init__(self, mensaje: str):
        self.mensaje = mensaje
        super().__init__(self.mensaje)


class NotEnoughFoodsError(MenuGenerationError):
    """No hay alimentos suficientes para el menú solicitado."""


class RestrictionViolationError(MenuGenerationError):
    """No se pueden cumplir las restricciones de la dieta."""


class InternalGenerationError(MenuGenerationError):
    """Invariante interna violada (error de programación)."""


# ---------------------------------------------------------------------------
# Estructuras de datos
# ---------------------------------------------------------------------------
@dataclass(frozen=True)
class CandidatoAlimento:
    """Alimento de la tabla ``alimento`` que puede entrar en un menú."""

    id_alimento: int
    nombre_alimento: str
    tipo_preparacion: TipoPreparacion
    nivel_calorico: NivelCalorico
    estado: EstadoCatalogo
    id_grupo: int


@dataclass(frozen=True)
class RestriccionDieta:
    """Límites de cantidad de un alimento dentro de una dieta."""

    id_alimento: int
    cantidad_minima: int
    cantidad_maxima: int


@dataclass(frozen=True)
class ParametrosGeneracion:
    """Parámetros con los que se genera un menú."""

    cantidad_total_alimentos: int
    proporciones: Mapping[TipoPreparacion, int]
    grupos_requeridos: Tuple[int, ...]

    def __post_init__(self) -> None:
        object.__setattr__(
            self, "proporciones", MappingProxyType(dict(self.proporciones))
        )
        object.__setattr__(self, "grupos_requeridos", tuple(self.grupos_requeridos))


@dataclass(frozen=True)
class MenuGenerado:
    """Composición de un menú generado y los parámetros usados."""

    ids_alimentos: Tuple[int, ...]
    parametros: ParametrosGeneracion


# ---------------------------------------------------------------------------
# Validación
# ---------------------------------------------------------------------------
def _validate_params(parametros: ParametrosGeneracion) -> None:
    """Valida cantidad total, proporciones (0-100, suman 100) y grupos."""
    if parametros.cantidad_total_alimentos <= 0:
        raise InvalidGenerationParamsError(
            "La cantidad total de alimentos debe ser mayor que cero."
        )

    suma = Decimal("0")
    for tipo, proporcion in parametros.proporciones.items():
        if tipo not in TIPOS_PREPARACION:
            raise InvalidGenerationParamsError(
                f"Tipo de preparación desconocido: {tipo!r}."
            )
        try:
            valor = Decimal(str(proporcion))
            if not valor.is_finite():
                raise InvalidOperation
            fuera_de_rango = valor < 0 or valor > 100
        except (InvalidOperation, ValueError):
            raise InvalidGenerationParamsError(
                f"Proporción inválida para {tipo!r}."
            ) from None
        if fuera_de_rango:
            raise InvalidGenerationParamsError(
                f"La proporción para {tipo!r} debe estar entre 0 y 100."
            )
        suma += valor

    if suma != Decimal("100"):
        raise InvalidGenerationParamsError(
            "Las proporciones de preparación deben sumar exactamente 100."
        )
    if len(set(parametros.grupos_requeridos)) > parametros.cantidad_total_alimentos:
        raise InvalidGenerationParamsError(
            "Hay más grupos requeridos que alimentos en el menú."
        )


def _validate_restrictions(
    restricciones: Iterable[RestriccionDieta],
) -> Dict[int, RestriccionDieta]:
    """Valida las restricciones y las indexa por alimento."""
    mapa: Dict[int, RestriccionDieta] = {}
    for r in restricciones:
        if r.id_alimento in mapa:
            raise InvalidGenerationParamsError(
                f"Restricción duplicada para el alimento {r.id_alimento}."
            )
        if r.cantidad_minima < 0 or r.cantidad_maxima < 0:
            raise InvalidGenerationParamsError(
                "Las cantidades de una restricción no pueden ser negativas."
            )
        if r.cantidad_minima > r.cantidad_maxima:
            raise InvalidGenerationParamsError(
                f"La cantidad mínima supera la máxima en el alimento {r.id_alimento}."
            )
        if r.cantidad_minima > 1:
            raise InvalidGenerationParamsError(
                f"El alimento {r.id_alimento} exige más de una aparición, "
                "pero un menú no repite alimentos."
            )
        mapa[r.id_alimento] = r
    return mapa


# ---------------------------------------------------------------------------
# Pasos del algoritmo
# ---------------------------------------------------------------------------
def _allocate_counts(parametros: ParametrosGeneracion) -> Dict[TipoPreparacion, int]:
    """Reparte la cantidad total entre los tipos (método del mayor residuo)."""
    cantidades: Dict[TipoPreparacion, int] = {}
    residuos: List[Tuple[Decimal, TipoPreparacion]] = []
    for tipo, proporcion in parametros.proporciones.items():
        exacta = (
            Decimal(parametros.cantidad_total_alimentos)
            * Decimal(str(proporcion))
            / Decimal("100")
        )
        cantidades[tipo] = int(exacta)
        residuos.append((exacta - int(exacta), tipo))

    faltantes = parametros.cantidad_total_alimentos - sum(cantidades.values())
    # Desempate por nombre para no depender del orden del diccionario.
    for _, tipo in sorted(residuos, key=lambda par: (-par[0], par[1]))[:faltantes]:
        cantidades[tipo] += 1
    return cantidades


def _available_candidates(
    candidatos: Iterable[CandidatoAlimento],
    restricciones: Mapping[int, RestriccionDieta],
) -> List[CandidatoAlimento]:
    """Quita borradores, excluidos y repetidos; ordena por id para que la semilla sea estable."""
    disponibles: Dict[int, CandidatoAlimento] = {}
    for c in candidatos:
        r = restricciones.get(c.id_alimento)
        excluido = r is not None and r.cantidad_maxima == 0
        if c.estado != ESTADO_BORRADOR and not excluido:
            disponibles.setdefault(c.id_alimento, c)
    return [disponibles[i] for i in sorted(disponibles)]


def _validate_candidates(
    candidatos: Sequence[CandidatoAlimento],
) -> None:
    """Valida que los candidatos usen los valores definidos en PostgreSQL."""
    for candidato in candidatos:
        if not candidato.nombre_alimento.strip():
            raise InvalidGenerationParamsError(
                f"El alimento {candidato.id_alimento} debe tener un nombre."
            )
        if candidato.tipo_preparacion not in TIPOS_PREPARACION:
            raise InvalidGenerationParamsError(
                f"Tipo de preparación desconocido: {candidato.tipo_preparacion!r}."
            )
        if candidato.nivel_calorico not in NIVELES_CALORICOS:
            raise InvalidGenerationParamsError(
                f"Nivel calórico desconocido: {candidato.nivel_calorico!r}."
            )
        if candidato.estado not in ESTADOS_CATALOGO:
            raise InvalidGenerationParamsError(
                f"Estado de catálogo desconocido: {candidato.estado!r}."
            )


def _select_required_groups(
    candidatos: Sequence[CandidatoAlimento],
    cantidades: Mapping[TipoPreparacion, int],
    grupos_requeridos: Sequence[int],
    restricciones: Mapping[int, RestriccionDieta],
    generador_aleatorio: random.Random,
) -> List[CandidatoAlimento]:
    """Elige los alimentos obligatorios y uno por cada grupo requerido."""
    por_id = {c.id_alimento: c for c in candidatos}
    restantes = dict(cantidades)
    seleccionados: List[CandidatoAlimento] = []
    ids_seleccionados: Set[int] = set()

    # 1) Alimentos obligatorios de la dieta.
    for id_alimento in sorted(restricciones):
        if restricciones[id_alimento].cantidad_minima < 1:
            continue
        c = por_id.get(id_alimento)
        if c is None:
            raise RestrictionViolationError(
                f"El alimento obligatorio {id_alimento} no está disponible."
            )
        if restantes.get(c.tipo_preparacion, 0) <= 0:
            raise RestrictionViolationError(
                f"El alimento obligatorio {id_alimento} no cabe en las "
                f"cantidades del tipo {c.tipo_preparacion!r}."
            )
        seleccionados.append(c)
        ids_seleccionados.add(id_alimento)
        restantes[c.tipo_preparacion] -= 1

    # 2) Grupos que aún faltan por cubrir.
    cubiertos = {c.id_grupo for c in seleccionados}
    por_cubrir = [g for g in sorted(set(grupos_requeridos)) if g not in cubiertos]
    opciones_por_grupo: Dict[int, List[CandidatoAlimento]] = {}
    for g in por_cubrir:
        opciones = [
            c for c in candidatos
            if c.id_grupo == g and c.id_alimento not in ids_seleccionados
        ]
        if not opciones:
            raise NotEnoughFoodsError(f"No hay alimentos disponibles para el grupo {g}.")
        generador_aleatorio.shuffle(opciones)
        opciones_por_grupo[g] = opciones

    # Primero los grupos con menos opciones útiles (mejor poda).
    por_cubrir.sort(
        key=lambda g: sum(
            restantes.get(c.tipo_preparacion, 0) > 0 for c in opciones_por_grupo[g]
        )
    )

    def search(indice: int, elegidos: List[CandidatoAlimento]):
        """Backtracking entre las opciones de cada grupo."""
        if indice == len(por_cubrir):
            return elegidos
        for c in opciones_por_grupo[por_cubrir[indice]]:
            if restantes.get(c.tipo_preparacion, 0) <= 0:
                continue
            restantes[c.tipo_preparacion] -= 1
            resultado = search(indice + 1, elegidos + [c])
            if resultado is not None:
                return resultado
            restantes[c.tipo_preparacion] += 1
        return None

    cobertura = search(0, [])
    if cobertura is None:
        raise NotEnoughFoodsError(
            "No se pueden cubrir los grupos requeridos con las cantidades "
            "solicitadas por tipo de preparación."
        )
    return seleccionados + cobertura


def _verify_menu(
    seleccionados: Sequence[CandidatoAlimento],
    cantidades: Mapping[TipoPreparacion, int],
    parametros: ParametrosGeneracion,
    restricciones: Mapping[int, RestriccionDieta],
) -> None:
    """Red de seguridad: comprueba que el menú cumple todo lo pedido."""
    ids = {c.id_alimento for c in seleccionados}
    if len(ids) != len(seleccionados):
        raise InternalGenerationError("El menú contiene alimentos repetidos.")
    if len(seleccionados) != parametros.cantidad_total_alimentos:
        raise InternalGenerationError("La cantidad total del menú es inválida.")

    por_tipo: Dict[TipoPreparacion, int] = {}
    for c in seleccionados:
        por_tipo[c.tipo_preparacion] = por_tipo.get(c.tipo_preparacion, 0) + 1
    for tipo, requerida in cantidades.items():
        if por_tipo.get(tipo, 0) != requerida:
            raise InternalGenerationError(f"Cantidad incorrecta para el tipo {tipo!r}.")

    if not set(parametros.grupos_requeridos) <= {c.id_grupo for c in seleccionados}:
        raise InternalGenerationError("El menú no cubre los grupos requeridos.")

    for id_alimento, r in restricciones.items():
        if not r.cantidad_minima <= int(id_alimento in ids) <= r.cantidad_maxima:
            raise InternalGenerationError(
                f"El alimento {id_alimento} incumple su restricción de cantidad."
            )


# ---------------------------------------------------------------------------
# Función pública
# ---------------------------------------------------------------------------
def generate_menu(
    candidatos: Iterable[CandidatoAlimento],
    restricciones: Iterable[RestriccionDieta],
    parametros: ParametrosGeneracion,
    semilla: Optional[int] = None,
) -> MenuGenerado:
    """Genera un menú válido o lanza un ``MenuGenerationError``."""
    _validate_params(parametros)
    lista_candidatos = list(candidatos)
    _validate_candidates(lista_candidatos)
    mapa_restricciones = _validate_restrictions(restricciones)
    cantidades = _allocate_counts(parametros)
    disponibles = _available_candidates(lista_candidatos, mapa_restricciones)
    generador_aleatorio = random.Random(semilla)

    seleccionados = _select_required_groups(
        disponibles,
        cantidades,
        parametros.grupos_requeridos,
        mapa_restricciones,
        generador_aleatorio,
    )

    # Completa cada tipo hasta su cantidad objetivo.
    ids_seleccionados = {c.id_alimento for c in seleccionados}
    por_tipo: Dict[TipoPreparacion, List[CandidatoAlimento]] = {}
    for c in disponibles:
        if c.id_alimento not in ids_seleccionados:
            por_tipo.setdefault(c.tipo_preparacion, []).append(c)

    for tipo in sorted(cantidades):
        faltan = cantidades[tipo] - sum(c.tipo_preparacion == tipo for c in seleccionados)
        opciones = por_tipo.get(tipo, [])
        if len(opciones) < faltan:
            raise NotEnoughFoodsError(
                f"No hay suficientes alimentos para el tipo {tipo!r}."
            )
        generador_aleatorio.shuffle(opciones)
        seleccionados.extend(opciones[:faltan])

    _verify_menu(seleccionados, cantidades, parametros, mapa_restricciones)
    return MenuGenerado(
        ids_alimentos=tuple(c.id_alimento for c in seleccionados),
        parametros=parametros,
    )