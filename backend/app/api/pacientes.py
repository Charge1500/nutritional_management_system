from fastapi import APIRouter, Depends, Query
from sqlalchemy.engine import Connection

from app.core.deps import get_current_user, require_role
from app.core.errors import AppError, sin_permiso
from app.core.postgres import get_db
from app.schemas.auth import UsuarioOut
from app.schemas.catalogo import DietOut
from app.schemas.usuario import AccountState, EnrollmentIn, PatientIn
from app.services import account_service, enrollment_service

router = APIRouter(prefix="/pacientes", tags=["Pacientes"])


def _patient_not_found() -> AppError:
    return AppError(404, "NO_ENCONTRADO", "El paciente no existe.")


@router.post("", response_model=UsuarioOut, status_code=201)
def register_patient(
    data: PatientIn, db: Connection = Depends(get_db), user: dict = Depends(require_role("nutricionista", "admin"))
):
    return account_service.register_patient(db, user, data.nombre, data.edad, data.sala, data.email)


@router.get("", response_model=list[UsuarioOut])
def list_patients(
    account_state: AccountState | None = Query(default=None, alias="estado_cuenta"),
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    return account_service.list_users(db, "paciente", account_state)


@router.get("/{patient_id}/dietas", response_model=list[DietOut])
def get_patient_diets(patient_id: int, db: Connection = Depends(get_db), user: dict = Depends(get_current_user)):
    if user["rol"] == "paciente":
        if user["id_usuario"] != patient_id:
            raise sin_permiso()
    elif user["rol"] not in ("nutricionista", "jefe"):
        raise sin_permiso()
    diets = enrollment_service.get_patient_diets(db, patient_id)
    if diets is None:
        raise _patient_not_found()
    return diets


@router.put("/{patient_id}/dietas", response_model=list[DietOut])
def set_patient_diets(
    patient_id: int,
    data: EnrollmentIn,
    db: Connection = Depends(get_db),
    user: dict = Depends(require_role("nutricionista", "admin")),
):
    diets = enrollment_service.set_patient_diets(db, patient_id, data.ids_dieta)
    if diets is None:
        raise _patient_not_found()
    return diets
