from sqlalchemy import text
from sqlalchemy.engine import Connection

_SELECT_USUARIO = """
SELECT u.id_usuario, u.nombre, u.email, u.contrasena,
       CASE WHEN a.id_usuario IS NOT NULL THEN 'admin'
            WHEN j.id_usuario IS NOT NULL THEN 'jefe'
            WHEN n.id_usuario IS NOT NULL THEN 'nutricionista'
            WHEN p.id_usuario IS NOT NULL THEN 'paciente' END AS rol,
       n.especialidad, p.edad, p.sala, p.estado_cuenta
FROM usuario u
LEFT JOIN administrador a ON a.id_usuario = u.id_usuario
LEFT JOIN jefe j          ON j.id_usuario = u.id_usuario
LEFT JOIN nutricionista n ON n.id_usuario = u.id_usuario
LEFT JOIN paciente p      ON p.id_usuario = u.id_usuario
"""


def get_usuario_por_id(db: Connection, id_usuario: int) -> dict | None:
    fila = db.execute(text(_SELECT_USUARIO + " WHERE u.id_usuario = :id"), {"id": id_usuario}).mappings().first()
    return dict(fila) if fila else None


def get_usuario_por_identificador(db: Connection, identificador: str) -> dict | None:
    sql = _SELECT_USUARIO + " WHERE lower(u.email) = lower(:ident) OR CAST(u.id_usuario AS TEXT) = :ident"
    fila = db.execute(text(sql), {"ident": identificador.strip()}).mappings().first()
    return dict(fila) if fila else None
