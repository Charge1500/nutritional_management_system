from fastapi import APIRouter
from app.api import grupos
api_router = APIRouter()
api_router.include_router(grupos.router)
