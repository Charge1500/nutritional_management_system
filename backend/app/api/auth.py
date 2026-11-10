from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from app.core.deps import get_current_user
from app.core.postgres import get_db
from app.schemas.auth import ActivarIn, LoginIn, TokenOut, UsuarioOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=TokenOut)
def login(datos: LoginIn, db: Connection = Depends(get_db)):
    token, usuario = auth_service.login(db, datos.identificador, datos.contrasena)
    # response_model=TokenOut filtra el diccionario: la contraseña NO sale.
    return {"access_token": token, "usuario": usuario}


@router.post("/activar", response_model=TokenOut)
def activar(datos: ActivarIn, db: Connection = Depends(get_db)):
    token, usuario = auth_service.activar_cuenta(db, datos.id_usuario, datos.email, datos.contrasena)
    return {"access_token": token, "usuario": usuario}


@router.get("/me", response_model=UsuarioOut)
def me(usuario: dict = Depends(get_current_user)):
    return usuario
