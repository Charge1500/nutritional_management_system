import pytest
from sqlalchemy import text

from app.core.postgres import engine
from app.main import app
from app.api import menus as menus_api


@pytest.fixture(scope="module", autouse=True)
def registrar_router_menus():
    app.include_router(menus_api.router, prefix="/api/v1")


@pytest.fixture(autouse=True)
def limpiar_menus_prueba():
    yield
    with engine.connect() as conexion:
        conexion.execute(text("DELETE FROM menu WHERE nombre_menu LIKE 'TEST menú %'"))
        conexion.commit()


def test_list_menus_requires_token(client):
    respuesta = client.get("/api/v1/menus")
    assert respuesta.status_code == 401


def test_list_menus_by_diet_rf12(client, otro_nutricionista):
    respuesta = client.get("/api/v1/menus?id_dieta=1", headers=otro_nutricionista)
    assert respuesta.status_code == 200
    assert any(menu["id_menu"] == 2 for menu in respuesta.json())


def test_list_menus_invalid_state(client, paciente):
    respuesta = client.get("/api/v1/menus?estado=desconocido", headers=paciente)
    assert respuesta.status_code == 422
    assert respuesta.json()["codigo"] == "DATOS_INVALIDOS"


def test_create_manual_menu_only_jefe(client, otro_nutricionista):
    respuesta = client.post(
        "/api/v1/menus/manual",
        json={"nombre_menu": "TEST menú manual permiso", "id_dieta": 1, "ids_alimentos": [1, 3, 5]},
        headers=otro_nutricionista,
    )
    assert respuesta.status_code == 403
    assert respuesta.json()["codigo"] == "SIN_PERMISO"


def test_create_manual_update_send_and_delete(client, jefe):
    creado = client.post(
        "/api/v1/menus/manual",
        json={"nombre_menu": "TEST menú manual crud", "id_dieta": 1, "ids_alimentos": [1, 3, 5]},
        headers=jefe,
    )
    assert creado.status_code == 201, creado.text
    menu = creado.json()
    assert menu["origen"] == "manual"
    assert menu["estado"] == "borrador"
    assert menu["creador"]["id_usuario"] == 2

    editado = client.put(
        f"/api/v1/menus/{menu['id_menu']}",
        json={"nombre_menu": "TEST menú manual editado"},
        headers=jefe,
    )
    assert editado.status_code == 200
    assert editado.json()["nombre_menu"] == "TEST menú manual editado"

    enviado = client.post(f"/api/v1/menus/{menu['id_menu']}/enviar-revision", headers=jefe)
    assert enviado.status_code == 200
    assert enviado.json()["estado"] == "pendiente"

    eliminado = client.delete(f"/api/v1/menus/{menu['id_menu']}", headers=jefe)
    assert eliminado.status_code == 409


def test_create_manual_reject_approve(client, jefe):
    creado = client.post(
        "/api/v1/menus/manual",
        json={"nombre_menu": "TEST menú manual revision", "id_dieta": 1, "ids_alimentos": [1, 3, 5]},
        headers=jefe,
    )
    assert creado.status_code == 201, creado.text
    id_menu = creado.json()["id_menu"]

    enviado = client.post(f"/api/v1/menus/{id_menu}/enviar-revision", headers=jefe)
    assert enviado.status_code == 200

    rechazar_sin_observaciones = client.post(
        f"/api/v1/menus/{id_menu}/revision",
        json={"resultado": "rechazado"},
        headers=jefe,
    )
    assert rechazar_sin_observaciones.status_code == 422

    rechazado = client.post(
        f"/api/v1/menus/{id_menu}/revision",
        json={"resultado": "rechazado", "observaciones": "Cambiar la composición."},
        headers=jefe,
    )
    assert rechazado.status_code == 200
    assert rechazado.json()["num_revision"] == 1
    assert rechazado.json()["resultado"] == "rechazado"

    enviado_corregido = client.post(f"/api/v1/menus/{id_menu}/enviar-revision", headers=jefe)
    assert enviado_corregido.status_code == 200
    assert enviado_corregido.json()["estado"] == "pendiente"

    aprobado = client.post(
        f"/api/v1/menus/{id_menu}/revision",
        json={"resultado": "aprobado", "observaciones": "Corregido."},
        headers=jefe,
    )
    assert aprobado.status_code == 200
    assert aprobado.json()["num_revision"] == 2
    assert aprobado.json()["resultado"] == "aprobado"


def test_create_automatic_menu(client, otro_nutricionista):
    respuesta = client.post(
        "/api/v1/menus/automatico",
        json={
            "nombre_menu": "TEST menú automático",
            "id_dieta": 1,
            "cantidad_total_alimentos": 8,
            "proporciones": {
                "entrante": 25,
                "plato_fuerte": 40,
                "postre": 20,
                "bebida": 15,
            },
            "grupos_requeridos": [2, 3, 5],
        },
        headers=otro_nutricionista,
    )
    assert respuesta.status_code == 201, respuesta.text
    menu = respuesta.json()
    assert menu["origen"] == "automatico"
    assert menu["cantidad_total_alimentos"] == 8
    assert sum(item["proporcion"] for item in menu["proporciones"]) == 100


def test_delete_draft_menu(client, jefe):
    creado = client.post(
        "/api/v1/menus/manual",
        json={"nombre_menu": "TEST menú borrar", "id_dieta": 1, "ids_alimentos": [1, 5]},
        headers=jefe,
    )
    assert creado.status_code == 201, creado.text

    eliminado = client.delete(f"/api/v1/menus/{creado.json()['id_menu']}", headers=jefe)
    assert eliminado.status_code == 204
