from fastapi import APIRouter
from app.api import auth,grupos,dietas,alimentos,fichas,pacientes,usuarios
api_router = APIRouter()
api_router.include_router(grupos.router)
api_router.include_router(auth.router)
api_router.include_router(dietas.router)
api_router.include_router(alimentos.router)
api_router.include_router(fichas.router)
api_router.include_router(pacientes.router)
api_router.include_router(usuarios.router)