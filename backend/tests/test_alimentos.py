import pytest
from sqlalchemy import text

from app.core.postgres import engine
from tests.conftest import _login


@pytest.fixture()
def admin(client):
    return _login(client, "marta.quesada@menus.local")  # administrador, id 1


@pytest.fixture()
def clean_test_foods():
    yield
    with engine.connect() as c:  # primero los platos (sus ingredientes caen en cascada), luego los simples
        c.execute(text("DELETE FROM alimento WHERE nombre_alimento LIKE 'TEST %' AND id_alimento IN (SELECT id_alimento FROM plato_compuesto)"))
        c.execute(text("DELETE FROM alimento WHERE nombre_alimento LIKE 'TEST %'"))
        c.commit()


def _body(name: str, **extra) -> dict:
    return {
        "nombre_alimento": name,
        "tipo_alimento": "simple",
        "tipo_preparacion": "entrante",
        "nivel_calorico": "bajo",
        "id_grupo_nutricional": 2,
        "estado": "guardado",
        **extra,
    }


def _create(client, headers, name: str, **extra) -> dict:
    r = client.post("/api/v1/alimentos", json=_body(name, **extra), headers=headers)
    assert r.status_code == 201, r.text
    return r.json()


# ------------------------------------------------------------------ lectura
def test_list_foods_requires_token(client):
    assert client.get("/api/v1/alimentos").status_code == 401


def test_list_foods(client, paciente):
    r = client.get("/api/v1/alimentos", headers=paciente)
    assert r.status_code == 200 and len(r.json()) >= 24
    types = {food["tipo_alimento"] for food in r.json()}
    assert types == {"simple", "compuesto"}
    assert {"id_alimento", "nombre_alimento", "tipo_preparacion", "nivel_calorico", "estado",
            "fecha_creacion", "id_grupo_nutricional", "id_creador"} <= set(r.json()[0])


def test_list_foods_filters(client, paciente):
    by_group = client.get("/api/v1/alimentos?id_grupo=5", headers=paciente).json()
    assert by_group and all(food["id_grupo_nutricional"] == 5 for food in by_group)
    by_prep = client.get("/api/v1/alimentos?tipo_preparacion=postre", headers=paciente).json()
    assert by_prep and all(food["tipo_preparacion"] == "postre" for food in by_prep)
    by_level = client.get("/api/v1/alimentos?nivel_calorico=alto", headers=paciente).json()
    assert by_level and all(food["nivel_calorico"] == "alto" for food in by_level)
    combined = client.get("/api/v1/alimentos?id_grupo=5&nivel_calorico=bajo", headers=paciente).json()
    assert all(f["id_grupo_nutricional"] == 5 and f["nivel_calorico"] == "bajo" for f in combined)


@pytest.mark.parametrize("query", ["estado=xx", "tipo_preparacion=xx", "nivel_calorico=xx", "id_grupo=abc"])
def test_list_foods_invalid_filter(client, paciente, query):
    r = client.get(f"/api/v1/alimentos?{query}", headers=paciente)
    assert r.status_code == 422 and r.json()["codigo"] == "DATOS_INVALIDOS"


def test_get_simple_food_detail(client, paciente):
    r = client.get("/api/v1/alimentos/5", headers=paciente)
    assert r.status_code == 200
    food = r.json()
    assert food["tipo_alimento"] == "simple" and food["ingredientes"] == []
    assert food["grupo"]["id_grupo_nutricional"] == food["id_grupo_nutricional"]
    assert food["creador"] == {"id_usuario": 4, "nombre": food["creador"]["nombre"]}
    assert "ficha" in food


def test_get_compound_food_detail(client, paciente):
    food = client.get("/api/v1/alimentos/21", headers=paciente).json()
    assert food["tipo_alimento"] == "compuesto" and len(food["ingredientes"]) > 0
    assert {"id_alimento", "nombre_alimento"} == set(food["ingredientes"][0])


def test_get_missing_food(client, paciente):
    r = client.get("/api/v1/alimentos/99999", headers=paciente)
    assert r.status_code == 404 and r.json()["codigo"] == "NO_ENCONTRADO"


def test_group_detail_includes_its_foods(client, paciente):
    r = client.get("/api/v1/grupos/5", headers=paciente)
    assert r.status_code == 200
    foods = r.json()["alimentos"]
    assert foods and all(food["id_grupo_nutricional"] == 5 for food in foods)


# ----------------------------------------------------------------- creación
def test_create_simple_food(client, creador_alimento5, clean_test_foods):
    food = _create(client, creador_alimento5, "TEST ensalada")
    assert food["tipo_alimento"] == "simple" and food["ingredientes"] == []
    assert food["creador"]["id_usuario"] == 4  # el creador es el usuario actual
    assert client.get(f"/api/v1/alimentos/{food['id_alimento']}", headers=creador_alimento5).json() == food


def test_create_food_default_state_is_draft(client, creador_alimento5, clean_test_foods):
    body = _body("TEST borrador")
    del body["estado"]
    r = client.post("/api/v1/alimentos", json=body, headers=creador_alimento5)
    assert r.status_code == 201 and r.json()["estado"] == "borrador"


def test_create_food_not_allowed_for_patient(client, paciente):
    r = client.post("/api/v1/alimentos", json=_body("TEST x"), headers=paciente)
    assert r.status_code == 403 and r.json()["codigo"] == "SIN_PERMISO"


def test_create_compound_food(client, creador_alimento5, clean_test_foods):
    food = _create(client, creador_alimento5, "TEST plato", tipo_alimento="compuesto", ids_ingredientes=[4, 5])
    assert food["tipo_alimento"] == "compuesto"
    assert {i["id_alimento"] for i in food["ingredientes"]} == {4, 5}


@pytest.mark.parametrize(
    "extra, field",
    [
        ({"nombre_alimento": ""}, "nombre_alimento"),
        ({"tipo_preparacion": "xx"}, "tipo_preparacion"),
        ({"nivel_calorico": "xx"}, "nivel_calorico"),
        ({"tipo_alimento": "compuesto"}, "ids_ingredientes"),  # un plato sin ingredientes
        ({"tipo_alimento": "compuesto", "ids_ingredientes": []}, "ids_ingredientes"),
        ({"ids_ingredientes": [4]}, "ids_ingredientes"),  # un simple con ingredientes
        ({"tipo_alimento": "compuesto", "ids_ingredientes": [4, 4]}, "ids_ingredientes"),
        ({"tipo_alimento": "compuesto", "ids_ingredientes": [99999]}, "ids_ingredientes"),
        ({"tipo_alimento": "compuesto", "ids_ingredientes": [21]}, "ids_ingredientes"),  # 21 es un plato, no un simple
        ({"id_grupo_nutricional": 99999}, "id_grupo_nutricional"),
    ],
)
def test_create_invalid_data(client, creador_alimento5, clean_test_foods, extra, field):
    r = client.post("/api/v1/alimentos", json=_body("TEST invalido", **extra), headers=creador_alimento5)
    assert r.status_code == 422 and field in r.json()["campos"]


def test_create_duplicate_name_ignores_case_and_edge_spaces(client, creador_alimento5, clean_test_foods):
    _create(client, creador_alimento5, "TEST pan")
    r = client.post("/api/v1/alimentos", json=_body("  test PAN "), headers=creador_alimento5)
    assert r.status_code == 409 and r.json()["codigo"] == "ALIMENTO_DUPLICADO"


def test_failed_create_leaves_nothing_behind(client, creador_alimento5):
    client.post("/api/v1/alimentos", json=_body("TEST fantasma", tipo_alimento="compuesto", ids_ingredientes=[99999]),
                headers=creador_alimento5)
    names = [f["nombre_alimento"] for f in client.get("/api/v1/alimentos", headers=creador_alimento5).json()]
    assert "TEST fantasma" not in names


# ------------------------------------------------------------------ edición
def test_update_food_by_creator(client, creador_alimento5, clean_test_foods):
    food = _create(client, creador_alimento5, "TEST editar")
    r = client.put(
        f"/api/v1/alimentos/{food['id_alimento']}",
        json=_body("TEST editado", nivel_calorico="alto", tipo_preparacion="postre"),
        headers=creador_alimento5,
    )
    assert r.status_code == 200
    assert (r.json()["nombre_alimento"], r.json()["nivel_calorico"], r.json()["tipo_preparacion"]) == ("TEST editado", "alto", "postre")


def test_update_food_keeping_its_own_name(client, creador_alimento5, clean_test_foods):
    food = _create(client, creador_alimento5, "TEST mismo")
    r = client.put(f"/api/v1/alimentos/{food['id_alimento']}", json=_body("TEST mismo", nivel_calorico="medio"),
                   headers=creador_alimento5)
    assert r.status_code == 200


def test_update_food_by_someone_else_is_forbidden(client, creador_alimento5, otro_nutricionista, clean_test_foods):
    food = _create(client, creador_alimento5, "TEST ajeno")
    r = client.put(f"/api/v1/alimentos/{food['id_alimento']}", json=_body("TEST ajeno 2"), headers=otro_nutricionista)
    assert r.status_code == 403 and r.json()["codigo"] == "SIN_PERMISO"


def test_update_missing_food(client, creador_alimento5):
    r = client.put("/api/v1/alimentos/99999", json=_body("TEST nada"), headers=creador_alimento5)
    assert r.status_code == 404


def test_update_cannot_change_type(client, creador_alimento5, clean_test_foods):
    food = _create(client, creador_alimento5, "TEST tipo")
    r = client.put(f"/api/v1/alimentos/{food['id_alimento']}",
                   json=_body("TEST tipo", tipo_alimento="compuesto", ids_ingredientes=[4]), headers=creador_alimento5)
    assert r.status_code == 422 and "tipo_alimento" in r.json()["campos"]


def test_update_to_an_existing_name_is_a_duplicate(client, creador_alimento5, clean_test_foods):
    _create(client, creador_alimento5, "TEST uno")
    second = _create(client, creador_alimento5, "TEST dos")
    r = client.put(f"/api/v1/alimentos/{second['id_alimento']}", json=_body("test UNO"), headers=creador_alimento5)
    assert r.status_code == 409 and r.json()["codigo"] == "ALIMENTO_DUPLICADO"
    still = client.get(f"/api/v1/alimentos/{second['id_alimento']}", headers=creador_alimento5).json()
    assert still["nombre_alimento"] == "TEST dos"


def test_update_compound_replaces_ingredients(client, creador_alimento5, clean_test_foods):
    dish = _create(client, creador_alimento5, "TEST guiso", tipo_alimento="compuesto", ids_ingredientes=[4, 5])
    r = client.put(f"/api/v1/alimentos/{dish['id_alimento']}",
                   json=_body("TEST guiso", tipo_alimento="compuesto", ids_ingredientes=[6]), headers=creador_alimento5)
    assert r.status_code == 200 and [i["id_alimento"] for i in r.json()["ingredientes"]] == [6]


# -------------------------------------------------------------- eliminación
def test_delete_unused_food(client, admin, creador_alimento5, clean_test_foods):
    food = _create(client, creador_alimento5, "TEST borrar")
    assert client.delete(f"/api/v1/alimentos/{food['id_alimento']}", headers=admin).status_code == 204
    assert client.get(f"/api/v1/alimentos/{food['id_alimento']}", headers=admin).status_code == 404


def test_delete_food_in_use_is_rejected(client, admin):
    with engine.connect() as c:
        used_id = c.execute(text("SELECT id_alimento FROM menu_alimento LIMIT 1")).scalar_one()
    r = client.delete(f"/api/v1/alimentos/{used_id}", headers=admin)
    assert r.status_code == 409 and r.json()["codigo"] == "ALIMENTO_EN_USO"
    assert client.get(f"/api/v1/alimentos/{used_id}", headers=admin).status_code == 200


def test_delete_missing_food(client, admin):
    assert client.delete("/api/v1/alimentos/99999", headers=admin).status_code == 404


def test_delete_only_admin(client, creador_alimento5, jefe):
    assert client.delete("/api/v1/alimentos/99999", headers=creador_alimento5).status_code == 403
    assert client.delete("/api/v1/alimentos/99999", headers=jefe).status_code == 403


# --------------------------------------------------------------- duplicados
def test_list_possible_duplicates(client, admin, creador_alimento5, clean_test_foods):
    first = _create(client, creador_alimento5, "TEST arroz integral")
    second = _create(client, creador_alimento5, "TEST  Arroz integral.")  # distinto para la base, igual para una persona
    r = client.get("/api/v1/alimentos/duplicados", headers=admin)
    assert r.status_code == 200
    pairs = [{f["id_alimento"] for f in pair["alimentos"]} for pair in r.json()]
    assert {first["id_alimento"], second["id_alimento"]} in pairs
    assert all(0.85 <= pair["similitud"] <= 1 for pair in r.json())


def test_duplicates_only_admin(client, creador_alimento5, jefe, paciente):
    for headers in (creador_alimento5, jefe, paciente):
        assert client.get("/api/v1/alimentos/duplicados", headers=headers).status_code == 403