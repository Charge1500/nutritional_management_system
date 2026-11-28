from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppError(Exception):
    def __init__(self, status_code: int, codigo: str, mensaje: str, campos: dict | None = None):
        self.status_code = status_code
        self.codigo = codigo
        self.mensaje = mensaje
        self.campos = campos

def credenciales_invalidas() -> AppError:
    return AppError(401, "CREDENCIALES_INVALIDAS", "Identificador o contraseña incorrectos.")

def cuenta_pendiente() -> AppError:
    return AppError(403, "CUENTA_PENDIENTE", "La cuenta aún no está activada.")

def sin_permiso() -> AppError:
    return AppError(403, "SIN_PERMISO", "No tiene permiso para esta acción.")

def _cuerpo(codigo: str, mensaje: str, campos: dict | None = None) -> dict:
    return {"codigo": codigo, "mensaje": mensaje, "campos": campos}

async def _manejar_app_error(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=_cuerpo(exc.codigo, exc.mensaje, exc.campos))

async def _manejar_validacion(request: Request, exc: RequestValidationError) -> JSONResponse:
    campos = {}
    for err in exc.errors():
        ruta = [str(parte) for parte in err["loc"] if parte not in ("body", "query", "path")]
        campos[".".join(ruta) or "_"] = err["msg"]
    return JSONResponse(status_code=422, content=_cuerpo("DATOS_INVALIDOS", "Revise los campos marcados.", campos))


async def _manejar_http(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    codigos = {401: "NO_AUTENTICADO", 403: "SIN_PERMISO", 404: "NO_ENCONTRADO", 405: "METODO_NO_PERMITIDO"}
    return JSONResponse(
        status_code=exc.status_code,
        content=_cuerpo(codigos.get(exc.status_code, "ERROR"), str(exc.detail)),
    )


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, _manejar_app_error)
    app.add_exception_handler(RequestValidationError, _manejar_validacion)
    app.add_exception_handler(StarletteHTTPException, _manejar_http)
