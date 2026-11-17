from fastapi import APIRouter
from app.api import auth,grupos,dietas,alimentos
api_router = APIRouter()
api_router.include_router(grupos.router)
api_router.include_router(auth.router)
api_router.include_router(dietas.router)
api_router.include_router(alimentos.router)