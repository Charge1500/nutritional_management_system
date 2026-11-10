def test_list_groups_requires_token(client):
    assert client.get("/api/v1/grupos").status_code == 401


def test_list_groups(client, paciente):
    r = client.get("/api/v1/grupos", headers=paciente)
    assert r.status_code == 200 and len(r.json()) > 0
    assert "cantidad_alimentos" in r.json()[0]


def test_list_groups_filters_by_state(client, paciente):
    r = client.get("/api/v1/grupos?estado=guardado", headers=paciente)
    assert r.status_code == 200
    assert all(group["estado"] == "guardado" for group in r.json())


def test_invalid_state_filter(client, paciente):
    r = client.get("/api/v1/grupos?estado=xx", headers=paciente)
    assert r.status_code == 422 and r.json()["codigo"] == "DATOS_INVALIDOS"


def test_get_missing_group(client, paciente):
    r = client.get("/api/v1/grupos/99999", headers=paciente)
    assert r.status_code == 404 and r.json()["codigo"] == "NO_ENCONTRADO"


def test_create_group_only_boss(client, paciente):
    r = client.post("/api/v1/grupos", json={"nombre_grupo": "TEST x"}, headers=paciente)
    assert r.status_code == 403 and r.json()["codigo"] == "SIN_PERMISO"


def test_create_group_and_duplicate(client, jefe, limpiar_grupos_de_prueba):
    r = client.post("/api/v1/grupos", json={"nombre_grupo": "TEST lácteos"}, headers=jefe)
    assert r.status_code == 201 and r.json()["estado"] == "borrador"
    r2 = client.post("/api/v1/grupos", json={"nombre_grupo": "TEST lácteos"}, headers=jefe)
    assert r2.status_code == 409 and r2.json()["codigo"] == "GRUPO_DUPLICADO"


def test_create_group_invalid_data(client, jefe):
    r = client.post("/api/v1/grupos", json={"nombre_grupo": ""}, headers=jefe)
    assert r.status_code == 422 and r.json()["campos"] == ["nombre_grupo"]