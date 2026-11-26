import mongomock
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.core.mongo import get_mongo_db
from app.core.postgres import engine
from app.main import app

PASSWORD = "Menus2026!"  # contraseña de los usuarios del seed


@pytest.fixture(scope="session")
def mongo_fake():
    return mongomock.MongoClient()["menus_fichas_test"]


@pytest.fixture()
def client(mongo_fake):
    app.dependency_overrides[get_mongo_db] = lambda: mongo_fake
    yield TestClient(app)
    app.dependency_overrides.clear()


def _login(client, email):
    r = client.post("/api/v1/auth/login", json={"identificador": email, "contrasena": PASSWORD})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture()
def jefe(client):
    return _login(client, "alberto.cabrera@menus.local")


@pytest.fixture()
def paciente(client):
    return _login(client, "ana.perez@menus.local")


@pytest.fixture()
def creador_alimento5(client):
    return _login(client, "raimundo.pena@menus.local")


@pytest.fixture()
def otro_nutricionista(client):
    return _login(client, "elena.torres@menus.local")


@pytest.fixture()
def limpiar_grupos_de_prueba():
    yield
    with engine.connect() as c:
        c.execute(text("DELETE FROM grupo_nutricional WHERE nombre_grupo LIKE 'TEST %'"))
        c.commit()
