from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

CatalogStatus = Literal["borrador", "guardado"]


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