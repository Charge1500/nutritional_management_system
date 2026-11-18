from typing import Any

from pydantic import BaseModel, Field


class SheetIn(BaseModel):
    informacion_nutricional: dict[str, Any] = Field(min_length=1)


class SheetOut(BaseModel):
    id_alimento: int
    informacion_nutricional: dict[str, Any]