import pytest
from sqlalchemy import text

from app.core.postgres import engine
from app.services import dieta_service
from tests.conftest import _login


@pytest.fixture()
def elena(client):
    return _login(client, "elena.torres@menus.local")  # nutricionista id 3


@pytest.fixture()
def clean_test_diets():
    yield
    with engine.connect() as c:  # ON DELETE CASCADE borra sus grupos, restricciones y nutricionistas
        c.execute(text("DELETE FROM dieta WHERE nombre_dieta LIKE 'TEST %'"))
        c.commit()


def _ids(table: str, column: str, count: int) -> list[int]:
    with engine.connect() as c:
        return list(c.execute(text(f"SELECT {column} FROM {table} ORDER BY {column} LIMIT :n"), {"n": count}).scalars())


def _body(name: str, **extra) -> dict:
    return {"nombre_dieta": name, "programa": "Prueba", "estado": "guardado", **extra}


def _create(client, headers, name: str, **extra) -> dict:
    r = client.post("/api/v1/dietas", json=_body(name, **extra), headers=headers)
    assert r.status_code == 201, r.text
    return r.json()


# ------------------------------------------------------------------ lectura
def test_list_diets_requires_token(client):
    assert client.get("/api/v1/dietas").status_code == 401


def test_list_diets(client, paciente):
    r = client.get("/api/v1/dietas", headers=paciente)
    assert r.status_code == 200 and len(r.json()) >= 4
    assert {"id_dieta", "nombre_dieta", "programa", "estado", "fecha_creacion"} <= set(r.json()[0])


def test_invalid_state_filter(client, paciente):
    r = client.get("/api/v1/dietas?estado=xx", headers=paciente)
    assert r.status_code == 422 and r.json()["codigo"] == "DATOS_INVALIDOS"


def test_list_authorized_diets_for_nutritionist(client, elena):
    r = client.get("/api/v1/dietas?autorizadas=true", headers=elena)
    assert r.status_code == 200
    got = {diet["id_dieta"] for diet in r.json()}
    with engine.connect() as c:
        expected = set(
            c.execute(
                text(
                    "SELECT nd.id_dieta FROM nutricionista_dieta nd JOIN dieta d ON d.id_dieta = nd.id_dieta "
                    "WHERE nd.id_nutricionista = 3 AND d.estado = 'guardado'"
                )
            ).scalars()
        )
    assert got == expected and got


def test_boss_attends_every_diet(client, jefe):
    all_saved = {d["id_dieta"] for d in client.get("/api/v1/dietas?estado=guardado", headers=jefe).json()}
    mine = {d["id_dieta"] for d in client.get("/api/v1/dietas?autorizadas=true", headers=jefe).json()}
    assert mine == all_saved


def test_get_diet_detail(client, paciente):
    r = client.get("/api/v1/dietas/1", headers=paciente)
    assert r.status_code == 200
    body = r.json()
    assert body["nombre_dieta"] == "Hipocalórica"
    assert len(body["grupos"]) > 0
    assert {"id_grupo_nutricional", "nombre_grupo"} == set(body["grupos"][0])
    for restriction in body["restricciones"]:
        assert {"alimento", "cantidad_minima", "cantidad_maxima"} == set(restriction)


def test_get_missing_diet(client, paciente):
    r = client.get("/api/v1/dietas/99999", headers=paciente)
    assert r.status_code == 404 and r.json()["codigo"] == "NO_ENCONTRADO"


# ----------------------------------------------------------------- creación
def test_create_diet_only_boss(client, paciente, elena):
    assert client.post("/api/v1/dietas", json=_body("TEST x"), headers=paciente).status_code == 403
    assert client.post("/api/v1/dietas", json=_body("TEST x"), headers=elena).status_code == 403


def test_create_diet_with_groups_and_restrictions(client, jefe, clean_test_diets):
    group_ids = _ids("grupo_nutricional", "id_grupo_nutricional", 2)
    food_id = _ids("alimento", "id_alimento", 1)[0]
    diet = _create(
        client,
        jefe,
        "TEST completa",
        ids_grupos=group_ids,
        restricciones=[{"id_alimento": food_id, "cantidad_minima": 1, "cantidad_maxima": 3}],
    )
    assert {g["id_grupo_nutricional"] for g in diet["grupos"]} == set(group_ids)
    assert diet["restricciones"][0]["alimento"]["id_alimento"] == food_id
    assert diet["restricciones"][0]["cantidad_maxima"] == 3
    # lo que devolvió el POST es lo que quedó guardado
    again = client.get(f"/api/v1/dietas/{diet['id_dieta']}", headers=jefe).json()
    assert again == diet


def test_create_diet_default_state_is_draft(client, jefe, clean_test_diets):
    r = client.post("/api/v1/dietas", json={"nombre_dieta": "TEST borrador", "programa": "P"}, headers=jefe)
    assert r.status_code == 201 and r.json()["estado"] == "borrador"


def test_create_duplicate_name(client, jefe, clean_test_diets):
    _create(client, jefe, "TEST repetida")
    r = client.post("/api/v1/dietas", json=_body("TEST repetida"), headers=jefe)
    assert r.status_code == 409 and r.json()["codigo"] == "DIETA_DUPLICADA"


@pytest.mark.parametrize(
    "extra, field",
    [
        ({"nombre_dieta": ""}, "nombre_dieta"),
        ({"ids_grupos": [1, 1]}, "ids_grupos"),
        ({"restricciones": [{"id_alimento": 1, "cantidad_minima": 5, "cantidad_maxima": 2}]}, "restricciones.0"),
        ({"restricciones": [{"id_alimento": 1, "cantidad_maxima": 1}, {"id_alimento": 1, "cantidad_maxima": 2}]}, "restricciones"),
    ],
)
def test_create_invalid_data(client, jefe, extra, field):
    body = {**_body("TEST invalida"), **extra}
    r = client.post("/api/v1/dietas", json=body, headers=jefe)
    assert r.status_code == 422 and field in r.json()["campos"]


def test_create_with_missing_group_creates_nothing(client, jefe):
    r = client.post("/api/v1/dietas", json=_body("TEST fantasma", ids_grupos=[99999]), headers=jefe)
    assert r.status_code == 422 and "ids_grupos" in r.json()["campos"]
    names = [d["nombre_dieta"] for d in client.get("/api/v1/dietas", headers=jefe).json()]
    assert "TEST fantasma" not in names


def test_create_with_missing_food_creates_nothing(client, jefe):
    body = _body("TEST sin alimento", restricciones=[{"id_alimento": 99999, "cantidad_maxima": 1}])
    r = client.post("/api/v1/dietas", json=body, headers=jefe)
    assert r.status_code == 422 and "restricciones" in r.json()["campos"]
    names = [d["nombre_dieta"] for d in client.get("/api/v1/dietas", headers=jefe).json()]
    assert "TEST sin alimento" not in names


# ------------------------------------------------------------------ edición
def test_update_diet_replaces_groups_and_restrictions(client, jefe, clean_test_diets):
    group_a, group_b = _ids("grupo_nutricional", "id_grupo_nutricional", 2)
    food_id = _ids("alimento", "id_alimento", 1)[0]
    diet = _create(
        client, jefe, "TEST editar", ids_grupos=[group_a],
        restricciones=[{"id_alimento": food_id, "cantidad_maxima": 2}],
    )
    r = client.put(
        f"/api/v1/dietas/{diet['id_dieta']}",
        json=_body("TEST editada", programa="Otro", ids_grupos=[group_b]),
        headers=jefe,
    )
    assert r.status_code == 200
    body = r.json()
    assert body["nombre_dieta"] == "TEST editada" and body["programa"] == "Otro"
    assert [g["id_grupo_nutricional"] for g in body["grupos"]] == [group_b]
    assert body["restricciones"] == []  # el PUT reemplaza: no se enviaron restricciones


def test_update_missing_diet(client, jefe):
    r = client.put("/api/v1/dietas/99999", json=_body("TEST nada"), headers=jefe)
    assert r.status_code == 404 and r.json()["codigo"] == "NO_ENCONTRADO"


def test_update_diet_only_boss(client, elena):
    assert client.put("/api/v1/dietas/1", json=_body("TEST x"), headers=elena).status_code == 403


def test_update_duplicate_name_changes_nothing(client, jefe, clean_test_diets):
    _create(client, jefe, "TEST uno")
    second = _create(client, jefe, "TEST dos", programa="Original")
    r = client.put(f"/api/v1/dietas/{second['id_dieta']}", json=_body("TEST uno", programa="Cambiado"), headers=jefe)
    assert r.status_code == 409 and r.json()["codigo"] == "DIETA_DUPLICADA"
    after = client.get(f"/api/v1/dietas/{second['id_dieta']}", headers=jefe).json()
    assert after["nombre_dieta"] == "TEST dos" and after["programa"] == "Original"


# ------------------------------------------------------------ nutricionistas
def test_set_nutritionists(client, jefe, elena, clean_test_diets):
    diet = _create(client, jefe, "TEST atendida")
    url = f"/api/v1/dietas/{diet['id_dieta']}/nutricionistas"

    def elena_sees_it() -> bool:
        listed = client.get("/api/v1/dietas?autorizadas=true", headers=elena).json()
        return diet["id_dieta"] in {d["id_dieta"] for d in listed}

    assert not elena_sees_it()
    r = client.put(url, json={"ids_nutricionista": [3]}, headers=jefe)
    assert r.status_code == 200 and r.json() == {"ids_nutricionista": [3]}
    assert elena_sees_it()
    assert client.put(url, json={"ids_nutricionista": []}, headers=jefe).status_code == 200
    assert not elena_sees_it()


def test_set_nutritionists_rejects_unknown_or_non_nutritionist(client, jefe, clean_test_diets):
    diet = _create(client, jefe, "TEST ids malos")
    url = f"/api/v1/dietas/{diet['id_dieta']}/nutricionistas"
    for bad_id in (99999, 6):  # 6 es un paciente
        r = client.put(url, json={"ids_nutricionista": [bad_id]}, headers=jefe)
        assert r.status_code == 422 and "ids_nutricionista" in r.json()["campos"]


def test_set_nutritionists_missing_diet_and_permissions(client, jefe, elena):
    assert client.put("/api/v1/dietas/99999/nutricionistas", json={"ids_nutricionista": [3]}, headers=jefe).status_code == 404
    assert client.put("/api/v1/dietas/1/nutricionistas", json={"ids_nutricionista": [3]}, headers=elena).status_code == 403


# ------------------------------------------- función que usará Backend 2
def test_nutritionist_attends_diet_function():
    with engine.connect() as db:
        assert dieta_service.nutritionist_attends_diet(db, 3, 1) is True    # Elena atiende la 1
        assert dieta_service.nutritionist_attends_diet(db, 3, 3) is False   # pero no la 3
        assert dieta_service.nutritionist_attends_diet(db, 2, 3) is True    # el jefe atiende todas