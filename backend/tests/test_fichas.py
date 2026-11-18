"""Pruebas de la ficha nutricional. MongoDB se sustituye por un Mongo falso en memoria (ver conftest)."""
import pytest
from pymongo.errors import ServerSelectionTimeoutError
from sqlalchemy import text

from app.core.mongo import get_mongo_db
from app.core.postgres import engine
from app.main import app
from tests.conftest import _login

SHEET = {"informacion_nutricional": {"descripcion": "Prueba", "calorias": 10}}
COLLECTION = "ficha_nutricional"


class BrokenMongo:
    """Simula un MongoDB caído: cualquier acceso a una colección falla."""

    def __getitem__(self, name):
        raise ServerSelectionTimeoutError("MongoDB no responde")


@pytest.fixture(autouse=True)
def clean_sheets(mongo_fake):
    mongo_fake[COLLECTION].delete_many({})
    yield
    mongo_fake[COLLECTION].delete_many({})


@pytest.fixture()
def admin(client):
    return _login(client, "marta.quesada@menus.local")


@pytest.fixture()
def clean_test_foods():
    yield
    with engine.connect() as c:
        c.execute(text("DELETE FROM alimento WHERE nombre_alimento LIKE 'TEST %'"))
        c.commit()


def _create_test_food(client, headers, name):
    body = {"nombre_alimento": name, "tipo_alimento": "simple", "tipo_preparacion": "entrante",
            "nivel_calorico": "bajo", "id_grupo_nutricional": 2, "estado": "guardado"}
    r = client.post("/api/v1/alimentos", json=body, headers=headers)
    assert r.status_code == 201, r.text
    return r.json()["id_alimento"]


# ------------------------------------------------------------ endpoint de la ficha
def test_sheet_requires_token(client):
    assert client.get("/api/v1/alimentos/5/ficha").status_code == 401
    assert client.put("/api/v1/alimentos/5/ficha", json=SHEET).status_code == 401


def test_missing_sheet(client, paciente):
    r = client.get("/api/v1/alimentos/5/ficha", headers=paciente)
    assert r.status_code == 404 and r.json()["codigo"] == "NO_ENCONTRADO"


def test_save_and_read_sheet(client, creador_alimento5, paciente):
    assert client.put("/api/v1/alimentos/5/ficha", json=SHEET, headers=creador_alimento5).status_code == 200
    r = client.get("/api/v1/alimentos/5/ficha", headers=paciente)
    assert r.json() == {"id_alimento": 5, **SHEET}


def test_save_replaces_the_whole_sheet(client, creador_alimento5, paciente):
    client.put("/api/v1/alimentos/5/ficha", json=SHEET, headers=creador_alimento5)
    second = {"informacion_nutricional": {"proteinas": 3}}
    client.put("/api/v1/alimentos/5/ficha", json=second, headers=creador_alimento5)
    assert client.get("/api/v1/alimentos/5/ficha", headers=paciente).json() == {"id_alimento": 5, **second}


def test_only_the_creator_edits(client, otro_nutricionista, jefe, paciente):
    for headers in (otro_nutricionista, jefe, paciente):
        r = client.put("/api/v1/alimentos/5/ficha", json=SHEET, headers=headers)
        assert r.status_code == 403 and r.json()["codigo"] == "SIN_PERMISO"


def test_sheet_for_missing_food(client, creador_alimento5):
    r = client.put("/api/v1/alimentos/99999/ficha", json=SHEET, headers=creador_alimento5)
    assert r.status_code == 409 and r.json()["codigo"] == "FICHA_SIN_ALIMENTO"


def test_empty_sheet_is_invalid(client, creador_alimento5):
    r = client.put("/api/v1/alimentos/5/ficha", json={"informacion_nutricional": {}}, headers=creador_alimento5)
    assert r.status_code == 422 and "informacion_nutricional" in r.json()["campos"]


# --------------------------------------------- la ficha dentro del detalle del alimento
def test_sheet_appears_in_food_detail(client, creador_alimento5, paciente):
    client.put("/api/v1/alimentos/5/ficha", json=SHEET, headers=creador_alimento5)
    assert client.get("/api/v1/alimentos/5", headers=paciente).json()["ficha"] == {"id_alimento": 5, **SHEET}
    assert client.get("/api/v1/alimentos/6", headers=paciente).json()["ficha"] is None


def test_sheet_appears_after_updating_the_food(client, creador_alimento5, clean_test_foods):
    food_id = _create_test_food(client, creador_alimento5, "TEST con ficha")
    client.put(f"/api/v1/alimentos/{food_id}/ficha", json=SHEET, headers=creador_alimento5)
    body = {"nombre_alimento": "TEST con ficha", "tipo_alimento": "simple", "tipo_preparacion": "entrante",
            "nivel_calorico": "medio", "id_grupo_nutricional": 2, "estado": "guardado"}
    r = client.put(f"/api/v1/alimentos/{food_id}", json=body, headers=creador_alimento5)
    assert r.status_code == 200 and r.json()["ficha"] == {"id_alimento": food_id, **SHEET}


def test_food_detail_survives_mongo_down(client, creador_alimento5, paciente):
    client.put("/api/v1/alimentos/5/ficha", json=SHEET, headers=creador_alimento5)
    app.dependency_overrides[get_mongo_db] = lambda: BrokenMongo()
    r = client.get("/api/v1/alimentos/5", headers=paciente)
    assert r.status_code == 200 and r.json()["ficha"] is None


def test_sheet_endpoint_fails_when_mongo_is_down(client, paciente):
    app.dependency_overrides[get_mongo_db] = lambda: BrokenMongo()
    with pytest.raises(ServerSelectionTimeoutError):  # aquí sí es un error: se pedía justo la ficha
        client.get("/api/v1/alimentos/5/ficha", headers=paciente)


# ------------------------------------------------- borrar el alimento borra su ficha
def test_deleting_a_food_deletes_its_sheet(client, admin, creador_alimento5, mongo_fake, clean_test_foods):
    food_id = _create_test_food(client, creador_alimento5, "TEST borrar ficha")
    client.put(f"/api/v1/alimentos/{food_id}/ficha", json=SHEET, headers=creador_alimento5)
    assert mongo_fake[COLLECTION].find_one({"id_alimento": food_id}) is not None
    assert client.delete(f"/api/v1/alimentos/{food_id}", headers=admin).status_code == 204
    assert mongo_fake[COLLECTION].find_one({"id_alimento": food_id}) is None


def test_deleting_a_food_works_when_mongo_is_down(client, admin, creador_alimento5, clean_test_foods):
    food_id = _create_test_food(client, creador_alimento5, "TEST mongo caido")
    app.dependency_overrides[get_mongo_db] = lambda: BrokenMongo()
    assert client.delete(f"/api/v1/alimentos/{food_id}", headers=admin).status_code == 204