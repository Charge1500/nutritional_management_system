from pydantic import BaseModel, Field

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class LoginIn(BaseModel):
    identificador: str = Field(min_length=1)
    contrasena: str = Field(min_length=1, max_length=72)


class ActivarIn(BaseModel):
    id_usuario: int
    email: str = Field(pattern=EMAIL_PATTERN, max_length=150)
    contrasena: str = Field(min_length=6, max_length=72)


class UsuarioOut(BaseModel):
    id_usuario: int
    nombre: str
    email: str
    rol: str
    especialidad: str | None = None  # solo nutricionista / jefe
    edad: int | None = None          # solo paciente
    sala: str | None = None          # solo paciente
    estado_cuenta: str | None = None  # solo paciente


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut
