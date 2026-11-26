"""Esquemas de los catálogos (grupos, dietas, alimentos)."""
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator, model_validator

CatalogStatus = Literal["borrador", "guardado"]
FoodType = Literal["simple", "compuesto"]
PreparationType = Literal["entrante", "plato_fuerte", "postre", "bebida"]
CalorieLevel = Literal["bajo", "medio", "alto"]


def _ensure_unique(values: list[int]) -> list[int]:
    if len(set(values)) != len(values):
        raise ValueError("No puede haber ids repetidos.")
    return values


# ---------------------------------------------------------------- Grupos
class GroupIn(BaseModel):
    nombre_grupo: str = Field(min_length=1, max_length=100)
    descripcion: str | None = None
    estado: CatalogStatus = "borrador"


class GroupOut(BaseModel):
    id_grupo_nutricional: int
    nombre_grupo: str
    descripcion: str | None = None
    estado: str
    fecha_creacion: datetime
    cantidad_alimentos: int | None = None  # solo en el listado


class GroupSummary(BaseModel):
    id_grupo_nutricional: int
    nombre_grupo: str


class FoodSummary(BaseModel):
    id_alimento: int
    nombre_alimento: str


# ---------------------------------------------------------------- Dietas
class DietRestrictionIn(BaseModel):
    id_alimento: int
    cantidad_minima: int = Field(default=0, ge=0)
    cantidad_maxima: int = Field(ge=0)

    @model_validator(mode="after")
    def check_range(self):
        if self.cantidad_maxima < self.cantidad_minima:
            raise ValueError("cantidad_maxima no puede ser menor que cantidad_minima.")
        return self


class DietIn(BaseModel):
    nombre_dieta: str = Field(min_length=1, max_length=100)
    programa: str = Field(min_length=1, max_length=100)
    estado: CatalogStatus = "borrador"
    ids_grupos: list[int] = Field(default_factory=list)
    restricciones: list[DietRestrictionIn] = Field(default_factory=list)

    @field_validator("ids_grupos")
    @classmethod
    def unique_group_ids(cls, value: list[int]) -> list[int]:
        return _ensure_unique(value)

    @field_validator("restricciones")
    @classmethod
    def unique_restricted_foods(cls, value: list[DietRestrictionIn]) -> list[DietRestrictionIn]:
        _ensure_unique([restriction.id_alimento for restriction in value])
        return value


class DietOut(BaseModel):
    id_dieta: int
    nombre_dieta: str
    programa: str
    estado: str
    fecha_creacion: datetime


class DietRestrictionOut(BaseModel):
    alimento: FoodSummary
    cantidad_minima: int
    cantidad_maxima: int


class DietDetailOut(DietOut):
    grupos: list[GroupSummary]
    restricciones: list[DietRestrictionOut]


class DietNutritionists(BaseModel):
    ids_nutricionista: list[int]

    @field_validator("ids_nutricionista")
    @classmethod
    def unique_ids(cls, value: list[int]) -> list[int]:
        return _ensure_unique(value)


# -------------------------------------------------------------- Alimentos
class FoodIn(BaseModel):
    nombre_alimento: str = Field(min_length=1, max_length=150)
    tipo_alimento: FoodType
    tipo_preparacion: PreparationType
    nivel_calorico: CalorieLevel
    id_grupo_nutricional: int
    estado: CatalogStatus = "borrador"
    # validate_default: la regla de abajo también debe aplicarse cuando el campo no se envía.
    ids_ingredientes: list[int] = Field(default_factory=list, validate_default=True)

    @field_validator("ids_ingredientes")
    @classmethod
    def check_ingredients(cls, value: list[int], info) -> list[int]:
        food_type = info.data.get("tipo_alimento")
        if food_type == "compuesto" and not value:
            raise ValueError("Un plato compuesto necesita al menos un ingrediente.")
        if food_type == "simple" and value:
            raise ValueError("Un alimento simple no tiene ingredientes.")
        return _ensure_unique(value)


class FoodOut(BaseModel):
    id_alimento: int
    nombre_alimento: str
    tipo_alimento: str
    tipo_preparacion: str
    nivel_calorico: str
    estado: str
    fecha_creacion: datetime
    id_grupo_nutricional: int
    id_creador: int


class UserSummary(BaseModel):
    id_usuario: int
    nombre: str


class FoodDetailOut(FoodOut):
    grupo: GroupSummary
    creador: UserSummary
    ingredientes: list[FoodSummary]  # vacío si es simple
    ficha: dict[str, Any] | None = None  # se rellena en la rama de la ficha nutricional


class DuplicatePairOut(BaseModel):
    similitud: float  # de 0 a 1
    alimentos: list[FoodSummary]  # los dos alimentos parecidos


class GroupDetailOut(GroupOut):
    alimentos: list[FoodOut]