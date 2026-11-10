from fastapi import APIRouter
from app.api import auth,grupos
api_router = APIRouter()
api_router.include_router(grupos.router)
api_router.include_router(auth.router)
