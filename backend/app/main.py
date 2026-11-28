from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.api.router import api_router
from app.core.config import settings
from app.core.errors import register_error_handlers
from app.core.postgres import get_db

app = FastAPI(title="API de Menús Nutricionales", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Sistema"])
def health(db: Connection = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"estado": "ok"}
