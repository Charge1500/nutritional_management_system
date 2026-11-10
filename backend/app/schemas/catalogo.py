from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

EstadoCatalogo = Literal["borrador", "guardado"]


class GrupoIn(BaseModel):
    nombre_grupo: str = Field(min_length=1, max_length=100)
    descripcion: str | None = None
    estado: EstadoCatalogo = "borrador"


class GrupoOut(BaseModel):
    id_grupo_nutricional: int
    nombre_grupo: str
    descripcion: str | None = None
    estado: str
    fecha_creacion: datetime
    cantidad_alimentos: int | None = None  # solo en el listado
