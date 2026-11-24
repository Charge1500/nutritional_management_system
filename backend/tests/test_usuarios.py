import pytest
from sqlalchemy import text

from app.core.postgres import engine
from tests.conftest import _login


@pytest.fixture()
def admin(client):
    return _login(client, "marta.quesada@menus.local")


@pytest.fixture()
def clean_test_users():
    yield
    with engine.connect() as c:  # ON DELETE CASCADE borra también su fila de nutricionista / administrador
        c.execute(text("DELETE FROM usuario WHERE nombre LIKE 'TEST %'"))
        c.commit()


def _staff(name: str, **extra) -> dict:
    return {"nombre": name, "rol": "nutricionista", "especialidad": "Pruebas", "contrasena": "Clave123", **extra}


def _count_users() -> int:
    with engine.connect() as c:
        return c.execute(text("SELECT count(*) FROM usuario")).scalar_one()


# ------------------------------------------------------------------ GET /usuarios
def test_list_users_requires_admin(client, jefe, paciente):
    assert client.get("/api/v1/usuarios").status_code == 401
    assert client.get("/api/v1/usuarios", headers=jefe).status_code == 403
    assert client.get("/api/v1/usuarios", headers=paciente).status_code == 403


def test_list_users(client, admin):
    r = client.get("/api/v1/usuarios", headers=admin)
    assert r.status_code == 200
    users = r.json()
    assert len(users) >= 17
    assert {u["rol"] for u in users} == {"admin", "jefe", "nutricionista", "paciente"}
    assert all("contrasena" not in u for u in users)  # el hash nunca sale


def test_list_users_filters(client, admin):
    jefes = client.get("/api/v1/usuarios?rol=jefe", headers=admin).json()
    assert [u["id_usuario"] for u in jefes] == [2]
    assert jefes[0]["especialidad"] == "Nutrición clínica"

    pending = client.get("/api/v1/usuarios?estado_cuenta=pendiente", headers=admin).json()
    assert {16, 17} <= {u["id_usuario"] for u in pending}
    assert all(u["rol"] == "paciente" and u["estado_cuenta"] == "pendiente" for u in pending)

    both = client.get("/api/v1/usuarios?rol=paciente&estado_cuenta=activa", headers=admin).json()
    assert both and all(u["rol"] == "paciente" and u["estado_cuenta"] == "activa" for u in both)


@pytest.mark.parametrize("query, field", [("rol=xx", "rol"), ("estado_cuenta=xx", "estado_cuenta")])
def test_list_users_invalid_filter(client, admin, query, field):
    r = client.get(f"/api/v1/usuarios?{query}", headers=admin)
    assert r.status_code == 422 and field in r.json()["campos"]


# ------------------------------------------------------------------ GET /nutricionistas
def test_list_nutritionists_requires_token(client):
    assert client.get("/api/v1/nutricionistas").status_code == 401


def test_list_nutritionists_for_any_user(client, paciente):
    r = client.get("/api/v1/nutricionistas", headers=paciente)
    assert r.status_code == 200
    users = r.json()
    assert {2, 3, 4, 5} <= {u["id_usuario"] for u in users}  # el jefe (2) también cuenta
    assert {u["rol"] for u in users} <= {"nutricionista", "jefe"}
    assert all(u["especialidad"] for u in users)


# ------------------------------------------------------------------ POST /usuarios
def test_create_nutritionist_and_login(client, admin, clean_test_users):
    r = client.post("/api/v1/usuarios", json=_staff("TEST Nutri", email="TEST.Nutri@Menus.local"), headers=admin)
    assert r.status_code == 201, r.text
    user = r.json()
    assert user["rol"] == "nutricionista" and user["especialidad"] == "Pruebas"
    assert user["email"] == "test.nutri@menus.local"  # el correo se guarda en minúsculas
    assert user["edad"] is None and "contrasena" not in user

    login = client.post("/api/v1/auth/login", json={"identificador": "test.nutri@menus.local", "contrasena": "Clave123"})
    assert login.status_code == 200 and login.json()["usuario"]["id_usuario"] == user["id_usuario"]


def test_create_admin_with_generated_email(client, admin, clean_test_users):
    body = {"nombre": "TEST Admin", "rol": "admin", "contrasena": "Clave123"}
    r = client.post("/api/v1/usuarios", json=body, headers=admin)
    assert r.status_code == 201, r.text
    user = r.json()
    assert user["rol"] == "admin" and user["especialidad"] is None
    assert user["email"] == f"admin{user['id_usuario']}@menus.local"  # correo generado


def test_create_user_only_admin(client, jefe, paciente):
    before = _count_users()
    assert client.post("/api/v1/usuarios", json=_staff("TEST X"), headers=jefe).status_code == 403
    assert client.post("/api/v1/usuarios", json=_staff("TEST X"), headers=paciente).status_code == 403
    assert client.post("/api/v1/usuarios", json=_staff("TEST X")).status_code == 401
    assert _count_users() == before


def test_create_user_duplicate_email(client, admin, clean_test_users):
    before = _count_users()
    r = client.post("/api/v1/usuarios", json=_staff("TEST Dup", email="ELENA.TORRES@menus.local"), headers=admin)
    assert r.status_code == 409 and r.json()["codigo"] == "EMAIL_EN_USO"
    assert _count_users() == before  # no queda nada a medias


@pytest.mark.parametrize(
    "extra, field",
    [
        ({"especialidad": None}, "especialidad"),           # un nutricionista necesita especialidad
        ({"especialidad": "   "}, "especialidad"),
        ({"rol": "admin"}, "especialidad"),                 # un admin no la tiene
        ({"rol": "jefe"}, "rol"),                           # el jefe no se crea por aquí
        ({"rol": "paciente"}, "rol"),                       # los pacientes tienen su propia ruta
        ({"contrasena": "123"}, "contrasena"),
        ({"email": "sin-arroba"}, "email"),
        ({"nombre": "   "}, "nombre"),
    ],
)
def test_create_user_invalid_data(client, admin, extra, field):
    before = _count_users()
    r = client.post("/api/v1/usuarios", json=_staff("TEST Invalido", **extra), headers=admin)
    assert r.status_code == 422 and r.json()["codigo"] == "DATOS_INVALIDOS"
    assert field in r.json()["campos"]
    assert _count_users() == before
