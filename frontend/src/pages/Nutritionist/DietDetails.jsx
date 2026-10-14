
import { useParams, useNavigate } from "react-router-dom";

import { ROLES } from "../../data/roles";
import { obtenerUsuarioPorId } from "../../services/userService";

import {
  obtenerDietaPorId,
  obtenerDietasAutorizadas,
  obtenerGruposDeDieta,
  obtenerRestriccionesDeDieta,
} from "../../services/dietService";

import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { useAuth } from "../../hooks/useAuth";

// Página reutilizable para nutricionistas y jefes de nutrición.
export const DietDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const crearMenu = () => {
    navigate(`/nutricionista/menus/nuevo`);
  };

  // Temporalmente utilizamos el usuario de prueba.
  const usuarioActual = obtenerUsuarioPorId(user.id_usuario);

  // Buscamos la dieta solicitada por su identificador.
  const dieta = obtenerDietaPorId(id);

  // Comprobamos si el usuario es jefe de nutrición.
  const esJefe = usuarioActual?.rol === ROLES.JEFE;

  // Obtenemos las dietas guardadas asignadas al nutricionista.
  const dietasAutorizadas = usuarioActual
    ? obtenerDietasAutorizadas(usuarioActual.id_usuario)
    : [];

  // El jefe puede consultar cualquier dieta.
  // El nutricionista solo puede consultar dietas guardadas
  // que tenga asignadas.
  const puedeVerDieta =
    Boolean(dieta) &&
    (
      esJefe ||
      (
        usuarioActual?.rol === ROLES.NUTRICIONISTA &&
        dieta.estado_dieta === "guardado" &&
        dietasAutorizadas.some(
          (d) => d.id_dieta === dieta.id_dieta
        )
      )
    );

  // Si no se encuentra la dieta o el usuario no tiene permiso,
  // no mostramos su información.
  if (!puedeVerDieta) {
    return (
      <section className="mx-auto max-w-3xl">
        <Card className="py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <span
              className="text-2xl text-slate-500"
              aria-hidden="true"
            >
              !
            </span>
          </div>

          <h1 className="mt-4 text-xl font-bold text-content">
            Dieta no disponible
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-content-muted">
            Esta dieta no está disponible para tu consulta.
            Puede que todavía esté en borrador o que no esté
            asignada a tu perfil.
          </p>

          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Volver
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  // Solo obtenemos los datos relacionados cuando la dieta
  // puede consultarse.
  const grupos = obtenerGruposDeDieta(dieta.id_dieta);
  const restricciones = obtenerRestriccionesDeDieta(
    dieta.id_dieta
  );

  return (
    <section className="mx-auto max-w-7xl space-y-8">





      {/* Navegación y acción principal */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 px-3 py-2"
        >
          <span aria-hidden="true">←</span>
          Volver
        </Button>

      </div>

      {/* Encabezado */}
      <header className="space-y-3">
        <p className="text-sm font-medium text-health-500">
          DETALLES DE LA DIETA
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            {dieta.nombre_dieta}
          </h1>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${dieta.estado_dieta === "guardado"
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-700"
              }`}
          >
            {dieta.estado_dieta === "guardado"
              ? "Guardado"
              : "Borrador"}
          </span>
        </div>

        <p className="text-sm text-content-muted">
          Consulta la información y las restricciones de esta dieta.
        </p>
      </header>

      {/* Información general */}
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-content">
            Información general
          </h2>
          <p className="mt-1 text-sm text-content-muted">
            Datos principales de la dieta.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-content-muted">
              Identificador
            </p>
            <p className="mt-1 font-medium text-content">
              {dieta.id_dieta}
            </p>
          </div>

          <div>
            <p className="text-sm text-content-muted">
              Programa de atención
            </p>
            <p className="mt-1 font-medium text-content">
              {dieta.programa}
            </p>
          </div>

          <div>
            <p className="text-sm text-content-muted">
              Fecha de creación
            </p>
            <p className="mt-1 font-medium text-content">
              {dieta.fecha_creacion}
            </p>
          </div>

          <div>
            <p className="text-sm text-content-muted">
              Rango calórico
            </p>
            <p className="mt-1 font-medium text-content">
              {dieta.calorias_minimas != null &&
                dieta.calorias_maximas != null
                ? `${dieta.calorias_minimas}–${dieta.calorias_maximas} kcal`
                : "No especificado"}
            </p>
          </div>
        </div>
      </Card>

      {/* Grupos nutricionales */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-content">
            Grupos nutricionales
          </h2>
          <p className="mt-1 text-sm text-content-muted">
            Grupos que debe cubrir esta dieta.
          </p>
        </div>

        {grupos.length === 0 ? (
          <p className="text-sm text-content-muted">
            No hay grupos nutricionales asociados a esta dieta.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grupos.map((grupo) => (
              <div
                key={grupo.id_grupo}
                className="rounded-lg border border-gray-200 p-4"
              >
                <h3 className="font-medium text-content">
                  {grupo.nombre_grupo}
                </h3>

                <p className="mt-1 text-sm text-content-muted">
                  {grupo.descripcion}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Restricciones alimentarias */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-content">
            Restricciones alimentarias
          </h2>
          <p className="mt-1 text-sm text-content-muted">
            Cantidades mínimas y máximas definidas para los alimentos.
          </p>
        </div>

        {restricciones.length === 0 ? (
          <p className="text-sm text-content-muted">
            No hay restricciones alimentarias registradas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-content-muted">

                  <th className="px-4 py-3 font-medium">
                    Alimento
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Cantidad mínima
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Cantidad máxima
                  </th>
                </tr>
              </thead>

              <tbody>
                {restricciones.map((restriccion) => (
                  <tr
                    key={`${restriccion.id_grupo}-${restriccion.id_alimento}`}
                    className="border-b border-gray-100 last:border-0"
                  >


                    <td className="px-4 py-3 font-medium text-content">
                      {restriccion.alimento?.nombre_alimento ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-content">
                      {restriccion.cantidad_minima}{" "}
                      {restriccion.unidad_medida}
                    </td>

                    <td className="px-4 py-3 text-content">
                      {restriccion.cantidad_maxima}{" "}
                      {restriccion.unidad_medida}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

        {/* Crear menú a partir de la dieta */}
{user?.rol === ROLES.NUTRICIONISTA && (
  <Card className="overflow-hidden border border-health-100 bg-gradient-to-br from-health-50/70 to-white shadow-sm">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-health-600 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 4h8m-9 4h10m-10 4h10m-10 4h6M5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"
            />
          </svg>
        </div>

        <div className="max-w-2xl">
          <h2 className="text-lg font-bold text-content">
            Diseña un menú para esta dieta
          </h2>

          <p className="mt-2 text-sm leading-6 text-content-muted">
            Utiliza los requisitos nutricionales, los grupos alimentarios
            y las restricciones definidos en esta dieta para crear una
            propuesta de menú adaptada a sus necesidades.
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <Button
          variant="health"
          onClick={() =>
            navigate(
              `/nutricionista/menus/nuevo?id_dieta=${dieta.id_dieta}`
            )
          }
          className="w-full gap-2 sm:w-auto"
        >
          Diseñar menú
          <span aria-hidden="true">→</span>
        </Button>
      </div>
    </div>
  </Card>
)}

    </section>
  );
};
