from sqlalchemy import text
from sqlalchemy.engine import Connection

from app.core.errors import AppError

_PATIENT_STATE = "SELECT estado_cuenta FROM paciente WHERE id_usuario = :patient_id"

_DIETS_OF = """
SELECT d.id_dieta, d.nombre_dieta, d.programa, d.estado, d.fecha_creacion
FROM inscripcion_dieta i
JOIN dieta d ON d.id_dieta = i.id_dieta
WHERE i.id_paciente = :patient_id
ORDER BY d.nombre_dieta
"""


def get_patient_diets(db: Connection, patient_id: int) -> list[dict] | None:
    if db.execute(text(_PATIENT_STATE), {"patient_id": patient_id}).first() is None:
        return None
    return [dict(row) for row in db.execute(text(_DIETS_OF), {"patient_id": patient_id}).mappings().all()]


def set_patient_diets(db: Connection, patient_id: int, diet_ids: list[int]) -> list[dict] | None:
    try:
        # FOR UPDATE: dos peticiones simultáneas sobre el mismo paciente se ejecutan una detrás de otra.
        row = db.execute(text(_PATIENT_STATE + " FOR UPDATE"), {"patient_id": patient_id}).first()
        if row is None:
            db.rollback()
            return None
        if row[0] == "pendiente":
            raise AppError(409, "PACIENTE_PENDIENTE", "Un paciente pendiente no puede inscribirse en dietas.")
        if diet_ids:
            found = db.execute(
                text("SELECT id_dieta FROM dieta WHERE id_dieta = ANY(CAST(:ids AS INTEGER[]))"), {"ids": diet_ids}
            ).scalars().all()
            missing = sorted(set(diet_ids) - set(found))
            if missing:
                raise AppError(422, "DATOS_INVALIDOS", "Revise los campos marcados.", {"ids_dieta": f"No existen: {missing}"})
        db.execute(text("DELETE FROM inscripcion_dieta WHERE id_paciente = :patient_id"), {"patient_id": patient_id})
        if diet_ids:
            db.execute(
                text("INSERT INTO inscripcion_dieta (id_paciente, id_dieta) VALUES (:patient_id, :diet_id)"),
                [{"patient_id": patient_id, "diet_id": diet_id} for diet_id in diet_ids],
            )
        db.commit()
    except Exception:
        db.rollback()
        raise
    return get_patient_diets(db, patient_id)
