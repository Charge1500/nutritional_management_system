from typing import Annotated, Literal

from pydantic import BaseModel, Field, StringConstraints, ValidationInfo, field_validator

from app.schemas.auth import EMAIL_PATTERN

UserRole = Literal["paciente", "nutricionista", "jefe", "admin"]
AccountState = Literal["pendiente", "activa"]
StaffRole = Literal["nutricionista", "admin"]

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
Room = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]


class PatientIn(BaseModel):
    nombre: Name
    edad: int = Field(ge=0, le=120)
    sala: Room
    email: str | None = Field(default=None, pattern=EMAIL_PATTERN, max_length=150)


class StaffUserIn(BaseModel):
    nombre: Name
    email: str | None = Field(default=None, pattern=EMAIL_PATTERN, max_length=150)
    rol: StaffRole
    especialidad: str | None = Field(default=None, max_length=100, validate_default=True)
    contrasena: str = Field(min_length=6, max_length=72)

    @field_validator("especialidad")
    @classmethod
    def check_specialty(cls, value: str | None, info: ValidationInfo) -> str | None:
        value = value.strip() if value else None
        role = info.data.get("rol")
        if role == "nutricionista" and not value:
            raise ValueError("La especialidad es obligatoria para un nutricionista.")
        if role == "admin" and value:
            raise ValueError("Un administrador no tiene especialidad.")
        return value


class EnrollmentIn(BaseModel):
    ids_dieta: list[int]

    @field_validator("ids_dieta")
    @classmethod
    def unique_ids(cls, value: list[int]) -> list[int]:
        if len(set(value)) != len(value):
            raise ValueError("No puede haber ids repetidos.")
        return value
