from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

TipoPreparacion = Literal["entrante", "plato_fuerte", "postre", "bebida"]
OrigenMenu = Literal["automatico", "manual"]
EstadoMenu = Literal["borrador", "pendiente", "aprobado", "rechazado"]
ResultadoRevision = Literal["aprobado", "rechazado"]

TIPOS_PREPARACION = {"entrante", "plato_fuerte", "postre", "bebida"}


def _ensure_unique(values: list[int]) -> list[int]:
    if len(set(values)) != len(values):
        raise ValueError("No puede haber ids repetidos.")
    return values


class UsuarioResumen(BaseModel):
    id_usuario: int
    nombre: str
    especialidad: str | None = None


class AutomaticMenuIn(BaseModel):
    nombre_menu: str = Field(min_length=1, max_length=150)
    id_dieta: int
    cantidad_total_alimentos: int = Field(gt=0)
    proporciones: dict[TipoPreparacion, int]
    grupos_requeridos: list[int] = Field(default_factory=list)

    @field_validator("grupos_requeridos")
    @classmethod
    def unique_required_groups(cls, value: list[int]) -> list[int]:
        return _ensure_unique(value)

    @model_validator(mode="after")
    def validate_proportions(self) -> "AutomaticMenuIn":
        if set(self.proporciones) != TIPOS_PREPARACION:
            raise ValueError("Las proporciones deben incluir entrante, plato_fuerte, postre y bebida.")
        if sum(self.proporciones.values()) != 100:
            raise ValueError("Las proporciones deben sumar exactamente 100.")
        if any(value < 0 or value > 100 for value in self.proporciones.values()):
            raise ValueError("Cada proporción debe estar entre 0 y 100.")
        if len(set(self.grupos_requeridos)) > self.cantidad_total_alimentos:
            raise ValueError("Hay más grupos requeridos que alimentos en el menú.")
        return self


class ManualMenuIn(BaseModel):
    nombre_menu: str = Field(min_length=1, max_length=150)
    id_dieta: int
    ids_alimentos: list[int] = Field(min_length=1)

    @field_validator("ids_alimentos")
    @classmethod
    def unique_food_ids(cls, value: list[int]) -> list[int]:
        return _ensure_unique(value)


class MenuUpdateIn(BaseModel):
    nombre_menu: str | None = Field(default=None, min_length=1, max_length=150)
    ids_alimentos: list[int] | None = None
    cantidad_total_alimentos: int | None = Field(default=None, gt=0)
    proporciones: dict[TipoPreparacion, int] | None = None
    grupos_requeridos: list[int] | None = None

    @field_validator("ids_alimentos")
    @classmethod
    def unique_food_ids(cls, value: list[int] | None) -> list[int] | None:
        return _ensure_unique(value) if value is not None else None

    @field_validator("grupos_requeridos")
    @classmethod
    def unique_required_groups(cls, value: list[int] | None) -> list[int] | None:
        return _ensure_unique(value) if value is not None else None

    @model_validator(mode="after")
    def validate_update(self) -> "MenuUpdateIn":
        if not self.model_fields_set:
            raise ValueError("Debe indicar al menos un campo para actualizar.")
        if (self.cantidad_total_alimentos is None) != (self.proporciones is None):
            raise ValueError(
                "cantidad_total_alimentos y proporciones deben enviarse juntos."
            )
        if self.proporciones is not None:
            if set(self.proporciones) != TIPOS_PREPARACION:
                raise ValueError("Las proporciones deben incluir entrante, plato_fuerte, postre y bebida.")
            if sum(self.proporciones.values()) != 100:
                raise ValueError("Las proporciones deben sumar exactamente 100.")
            if any(value < 0 or value > 100 for value in self.proporciones.values()):
                raise ValueError("Cada proporción debe estar entre 0 y 100.")
        if self.grupos_requeridos is not None and self.cantidad_total_alimentos is not None:
            if len(set(self.grupos_requeridos)) > self.cantidad_total_alimentos:
                raise ValueError("Hay más grupos requeridos que alimentos en el menú.")
        return self


class MenuFoodOut(BaseModel):
    id_alimento: int
    nombre_alimento: str
    tipo_preparacion: str
    nivel_calorico: str


class MenuProportionOut(BaseModel):
    tipo_preparacion: TipoPreparacion
    proporcion: float


class MenuGroupOut(BaseModel):
    id_grupo_nutricional: int
    nombre_grupo: str


class ReviewMenuIn(BaseModel):
    resultado: ResultadoRevision
    observaciones: str | None = None

    @model_validator(mode="after")
    def validate_observations(self) -> "ReviewMenuIn":
        if self.resultado == "rechazado" and (
            self.observaciones is None or not self.observaciones.strip()
        ):
            raise ValueError("Las observaciones son obligatorias al rechazar un menú.")
        return self


class ReviewMenuOut(BaseModel):
    id_menu: int
    num_revision: int
    id_jefe: int
    jefe: UsuarioResumen
    fecha_revision: datetime
    resultado: ResultadoRevision
    observaciones: str | None = None


class MenuSummaryOut(BaseModel):
    id_menu: int
    nombre_menu: str
    id_dieta: int
    id_creador: int
    creador: UsuarioResumen
    fecha_creacion: datetime
    estado: EstadoMenu
    origen: OrigenMenu


class MenuDetailOut(MenuSummaryOut):
    id_jefe_indica: int | None = None
    cantidad_total_alimentos: int | None = None
    proporciones: list[MenuProportionOut] = Field(default_factory=list)
    grupos_requeridos: list[MenuGroupOut] = Field(default_factory=list)
    alimentos: list[MenuFoodOut] = Field(default_factory=list)
    revisiones: list[ReviewMenuOut] = Field(default_factory=list)


MenuOut = MenuDetailOut
