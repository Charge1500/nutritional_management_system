from sqlalchemy import text

from app.core.postgres import engine
from tests.conftest import PASSWORD


def test_health(client):
    assert client.get("/health").json() == {"estado": "ok"}


def test_login_ok_y_no_expone_contrasena(client):
    r = client.post("/api/v1/auth/login", json={"identificador": "alberto.cabrera@menus.local", "contrasena": PASSWORD})
    assert r.status_code == 200
    cuerpo = r.json()
    assert cuerpo["usuario"]["rol"] == "jefe"
    assert "contrasena" not in cuerpo["usuario"]


def test_login_por_id(client):
    r = client.post("/api/v1/auth/login", json={"identificador": "1", "contrasena": PASSWORD})
    assert r.status_code == 200 and r.json()["usuario"]["rol"] == "admin"


def test_login_clave_incorrecta(client):
    r = client.post("/api/v1/auth/login", json={"identificador": "1", "contrasena": "mala"})
    assert r.status_code == 401 and r.json()["codigo"] == "CREDENCIALES_INVALIDAS"


def test_login_paciente_pendiente(client):
    r = client.post("/api/v1/auth/login", json={"identificador": "16", "contrasena": PASSWORD})
    assert r.status_code == 403 and r.json()["codigo"] == "CUENTA_PENDIENTE"


def test_me_sin_token(client):
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401 and r.json()["codigo"] == "NO_AUTENTICADO"


def test_me_con_token(client, paciente):
    r = client.get("/api/v1/auth/me", headers=paciente)
    assert r.status_code == 200 and r.json()["rol"] == "paciente"


def test_activar_cuenta_pendiente(client):
    r = client.post("/api/v1/auth/activar", json={"id_usuario": 16, "email": "test.activar@menus.local", "contrasena": "Nueva123"})
    try:
        assert r.status_code == 200 and r.json()["usuario"]["estado_cuenta"] == "activa"
        # una segunda activación ya no procede
        r2 = client.post("/api/v1/auth/activar", json={"id_usuario": 16, "email": "otro@menus.local", "contrasena": "Nueva123"})
        assert r2.status_code == 409 and r2.json()["codigo"] == "CUENTA_NO_PENDIENTE"
    finally:  # dejar la base como estaba
        with engine.connect() as c:
            c.execute(text("UPDATE usuario SET contrasena = NULL WHERE id_usuario = 16"))
            c.execute(text("UPDATE paciente SET estado_cuenta = 'pendiente' WHERE id_usuario = 16"))
            c.commit()
