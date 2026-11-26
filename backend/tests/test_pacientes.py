import pytest
from sqlalchemy import text

from app.core.postgres import engine
from tests.conftest import PASSWORD, _login

NEW_PASSWORD = "Clave123"


@pytest.fixture()
def admin(client):
    return _login(client, "marta.quesada@menus.local")


@pytest.fixture()
def elena(client):
    return _login(client, "elena.torres@menus.local")


@pytest.fixture()
def clean_test_patients():
    yield
    with engine.connect() as c:  # ON DELETE CASCADE borra paciente e inscripciones
        c.execute(text("DELETE FROM usuario WHERE nombre LIKE 'TEST %'"))
        c.commit()


def _body(name: str, **extra) -> dict:
    return {"nombre": name, "edad": 40, "sala": "Sala T", **extra}


def _register(client, headers, name: str, **extra) -> dict:
    r = client.post("/api/v1/pacientes", json=_body(name, **extra), headers=headers)
    assert r.status_code == 201, r.text
    return r.json()


def _active_patient(client, admin, name: str) -> dict:
    """Registra un paciente de prueba y activa su cuenta: queda listo para inscribirlo."""
    patient = _register(client, admin, name)
    email = f"{name.lower().replace(' ', '.')}@menus.local"
    r = client.post(
        "/api/v1/auth/activar",
        json={"id_usuario": patient["id_usuario"], "email": email, "contrasena": NEW_PASSWORD},
    )
    assert r.status_code == 200, r.text
    return {"id": patient["id_usuario"], "headers": {"Authorization": f"Bearer {r.json()['access_token']}"}}


def _diet_ids(client, headers, patient_id: int) -> list[int]:
    r = client.get(f"/api/v1/pacientes/{patient_id}/dietas", headers=headers)
    assert r.status_code == 200, r.text
    return sorted(d["id_dieta"] for d in r.json())


def _db_row(patient_id: int):
    with engine.connect() as c:
        return c.execute(
            text("SELECT id_nutri_registra, fecha_registro FROM paciente WHERE id_usuario = :id"), {"id": patient_id}
        ).first()


# ------------------------------------------------------------------ POST /pacientes
def test_register_patient_by_nutritionist(client, elena, clean_test_patients):
    user = _register(client, elena, "TEST Paciente Uno")
    assert user["rol"] == "paciente" and user["estado_cuenta"] == "pendiente"
    assert user["edad"] == 40 and user["sala"] == "Sala T"
    assert user["email"] == f"paciente{user['id_usuario']}@menus.local"  # generado: no se envió correo
    assert "contrasena" not in user
    registered_by, registered_at = _db_row(user["id_usuario"])
    assert registered_by == 3 and registered_at is not None  # queda quién y cuándo


def test_register_patient_by_admin_has_no_registrar(client, admin, clean_test_patients):
    user = _register(client, admin, "TEST Paciente Dos", email="TEST.Dos@Menus.local")
    assert user["email"] == "test.dos@menus.local"
    assert _db_row(user["id_usuario"]) == (None, None)  # lo registró el admin: no se guarda nutricionista


def test_register_patient_by_boss(client, jefe, clean_test_patients):
    user = _register(client, jefe, "TEST Paciente Tres")
    assert _db_row(user["id_usuario"])[0] == 2  # el jefe es nutricionista


def test_register_patient_not_allowed_for_patient(client, paciente):
    assert client.post("/api/v1/pacientes", json=_body("TEST X"), headers=paciente).status_code == 403
    assert client.post("/api/v1/pacientes", json=_body("TEST X")).status_code == 401


def test_register_patient_duplicate_email(client, admin):
    r = client.post("/api/v1/pacientes", json=_body("TEST Dup", email="ana.perez@menus.local"), headers=admin)
    assert r.status_code == 409 and r.json()["codigo"] == "EMAIL_EN_USO"


@pytest.mark.parametrize(
    "extra, field",
    [
        ({"nombre": "  "}, "nombre"),
        ({"edad": 121}, "edad"),
        ({"edad": -1}, "edad"),
        ({"edad": "abc"}, "edad"),
        ({"sala": ""}, "sala"),
        ({"email": "sin-arroba"}, "email"),
    ],
)
def test_register_patient_invalid_data(client, admin, extra, field):
    r = client.post("/api/v1/pacientes", json=_body("TEST Invalido", **extra), headers=admin)
    assert r.status_code == 422 and field in r.json()["campos"]


def test_pending_patient_cannot_login_until_activated(client, admin, clean_test_patients):
    user = _register(client, admin, "TEST Pendiente")
    login = {"identificador": str(user["id_usuario"]), "contrasena": PASSWORD}
    r = client.post("/api/v1/auth/login", json=login)
    assert r.status_code == 403 and r.json()["codigo"] == "CUENTA_PENDIENTE"

    act = client.post(
        "/api/v1/auth/activar",
        json={"id_usuario": user["id_usuario"], "email": "test.pendiente@menus.local", "contrasena": NEW_PASSWORD},
    )
    assert act.status_code == 200 and act.json()["usuario"]["estado_cuenta"] == "activa"
    ok = client.post("/api/v1/auth/login", json={"identificador": "test.pendiente@menus.local", "contrasena": NEW_PASSWORD})
    assert ok.status_code == 200


# ------------------------------------------------------------------ GET /pacientes
def test_list_patients_only_admin(client, jefe, elena, paciente):
    assert client.get("/api/v1/pacientes").status_code == 401
    for headers in (jefe, elena, paciente):
        assert client.get("/api/v1/pacientes", headers=headers).status_code == 403


def test_list_patients(client, admin):
    r = client.get("/api/v1/pacientes", headers=admin)
    assert r.status_code == 200
    assert len(r.json()) >= 12 and all(u["rol"] == "paciente" for u in r.json())


def test_list_pending_patients(client, admin):
    r = client.get("/api/v1/pacientes?estado_cuenta=pendiente", headers=admin)
    assert r.status_code == 200
    assert {16, 17} <= {u["id_usuario"] for u in r.json()}
    assert all(u["estado_cuenta"] == "pendiente" for u in r.json())


# ------------------------------------------------------------------ GET /pacientes/{id}/dietas
def test_patient_reads_own_diets(client, paciente):
    r = client.get("/api/v1/pacientes/6/dietas", headers=paciente)  # Ana = id 6
    assert r.status_code == 200
    assert [d["id_dieta"] for d in r.json()] == [1]
    assert {"id_dieta", "nombre_dieta", "programa", "estado", "fecha_creacion"} <= set(r.json()[0])


def test_patient_cannot_read_someone_elses_diets(client, paciente):
    assert client.get("/api/v1/pacientes/7/dietas", headers=paciente).status_code == 403
    assert client.get("/api/v1/pacientes/99999/dietas", headers=paciente).status_code == 403  # no revela qué ids existen


def test_nutritionist_reads_patient_diets(client, elena, jefe):
    assert _diet_ids(client, elena, 8) == [1, 3]
    assert _diet_ids(client, jefe, 8) == [1, 3]


def test_admin_cannot_read_patient_diets(client, admin):
    assert client.get("/api/v1/pacientes/8/dietas", headers=admin).status_code == 403


def test_read_diets_of_missing_or_non_patient(client, elena):
    assert client.get("/api/v1/pacientes/99999/dietas", headers=elena).status_code == 404
    assert client.get("/api/v1/pacientes/3/dietas", headers=elena).status_code == 404  # el 3 es un nutricionista
    assert client.get("/api/v1/pacientes/3/dietas").status_code == 401


# ------------------------------------------------------------------ PUT /pacientes/{id}/dietas
def test_enroll_patient(client, admin, elena, clean_test_patients):
    patient = _active_patient(client, admin, "TEST Inscrito")
    assert _diet_ids(client, elena, patient["id"]) == []

    r = client.put(f"/api/v1/pacientes/{patient['id']}/dietas", json={"ids_dieta": [2, 1]}, headers=elena)
    assert r.status_code == 200, r.text
    assert sorted(d["id_dieta"] for d in r.json()) == [1, 2]  # devuelve las dietas resultantes
    assert _diet_ids(client, patient["headers"], patient["id"]) == [1, 2]  # y el propio paciente las ve


def test_enroll_replaces_previous_list(client, admin, jefe, clean_test_patients):
    patient = _active_patient(client, admin, "TEST Reemplazo")
    url = f"/api/v1/pacientes/{patient['id']}/dietas"
    assert client.put(url, json={"ids_dieta": [1, 2]}, headers=jefe).status_code == 200
    assert client.put(url, json={"ids_dieta": [3]}, headers=jefe).status_code == 200
    assert _diet_ids(client, jefe, patient["id"]) == [3]
    assert client.put(url, json={"ids_dieta": []}, headers=admin).json() == []  # lista vacía = sin dietas
    assert _diet_ids(client, jefe, patient["id"]) == []


def test_enroll_rejects_pending_patient(client, elena):
    before = _diet_ids(client, elena, 16)
    r = client.put("/api/v1/pacientes/16/dietas", json={"ids_dieta": [1]}, headers=elena)  # 16 = pendiente
    assert r.status_code == 409 and r.json()["codigo"] == "PACIENTE_PENDIENTE"
    assert _diet_ids(client, elena, 16) == before == []


def test_enroll_unknown_diet_changes_nothing(client, admin, elena, clean_test_patients):
    patient = _active_patient(client, admin, "TEST Dieta Falsa")
    url = f"/api/v1/pacientes/{patient['id']}/dietas"
    assert client.put(url, json={"ids_dieta": [1]}, headers=elena).status_code == 200
    r = client.put(url, json={"ids_dieta": [2, 9999]}, headers=elena)
    assert r.status_code == 422 and "ids_dieta" in r.json()["campos"]
    assert _diet_ids(client, elena, patient["id"]) == [1]  # sigue como estaba


def test_enroll_rejects_repeated_ids(client, elena):
    r = client.put("/api/v1/pacientes/6/dietas", json={"ids_dieta": [1, 1]}, headers=elena)
    assert r.status_code == 422 and "ids_dieta" in r.json()["campos"]


def test_enroll_missing_or_non_patient(client, elena):
    assert client.put("/api/v1/pacientes/99999/dietas", json={"ids_dieta": []}, headers=elena).status_code == 404
    assert client.put("/api/v1/pacientes/3/dietas", json={"ids_dieta": []}, headers=elena).status_code == 404


def test_enroll_permissions(client, paciente):
    body = {"ids_dieta": [1]}
    assert client.put("/api/v1/pacientes/6/dietas", json=body).status_code == 401
    assert client.put("/api/v1/pacientes/6/dietas", json=body, headers=paciente).status_code == 403  # ni siquiera el suyo
