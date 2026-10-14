
import { useParams, useNavigate } from "react-router-dom";

import {
  obtenerAlimentoPorId,
  obtenerGruposDeAlimento,
  obtenerIngredientesDeAlimento,
} from "../../services/foodService";

import { obtenerUsuarioPorId } from "../../services/userService";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { useAuth } from "../../hooks/useAuth";

// Muestra un dato individual con una etiqueta y su valor.
const InfoItem = ({ label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
    <p className="text-xs font-medium uppercase tracking-wide text-content-muted">
      {label}
    </p>

    <p className="mt-2 break-words font-semibold text-content">
      {value ?? "No disponible"}
    </p>
  </div>
);

// Título reutilizable para las distintas secciones.
const SectionHeading = ({ title, description }) => (
  <div className="mb-5">
    <h2 className="text-lg font-bold tracking-tight text-content">
      {title}
    </h2>

    {description && (
      <p className="mt-1 text-sm leading-6 text-content-muted">
        {description}
      </p>
    )}
  </div>
);

// Página de detalles de un alimento.
export const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Buscamos el alimento por su identificador.
  const food = obtenerAlimentoPorId(Number(id));

  // Comprobamos primero que el alimento exista.
  if (!food) {
    return (
      <section className="mx-auto max-w-3xl py-8">
        <Card className="border border-gray-200 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <span
              className="text-2xl font-semibold text-gray-500"
              aria-hidden="true"
            >
              !
            </span>
          </div>

          <h1 className="mt-4 text-xl font-bold text-content">
            Alimento no disponible
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-content-muted">
            No se encontró el alimento solicitado. Comprueba el
            identificador o regresa al catálogo.
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

  // Obtenemos los datos relacionados con el alimento.
  const grupos = obtenerGruposDeAlimento(food.id_alimento);

  const ingredientes =
    food.tipo_alimento === "compuesto"
      ? obtenerIngredientesDeAlimento(food.id_alimento)
      : [];

  const nutricionista = obtenerUsuarioPorId(
    food.id_usuario_creador
  );

  // El creador y el jefe de nutrición pueden editar el alimento.
  const puedeEditar =
    Boolean(user) &&
    (
      user.id_usuario === food.id_usuario_creador ||
      user.rol === "jefe"
    );

  // Navega al formulario en modo edición.
  const handleEditar = () => {
    navigate(
      `/nutricionista/alimentos/nuevo?id=${food.id_alimento}`
    );
  };

  // Colores según el estado de aprobación.
  const estilosEstado = {
    aprobado: "bg-green-100 text-green-800 ring-green-200",
    pendiente: "bg-amber-100 text-amber-800 ring-amber-200",
    rechazado: "bg-red-100 text-red-800 ring-red-200",
    borrador: "bg-gray-100 text-gray-700 ring-gray-200",
    guardado: "bg-green-100 text-green-800 ring-green-200",
  };

  const estiloEstado =
    estilosEstado[food.estado_alimento] ??
    "bg-gray-100 text-gray-700 ring-gray-200";

  const estadoFormateado = food.estado_alimento
    ? food.estado_alimento.charAt(0).toUpperCase() +
      food.estado_alimento.slice(1)
    : "Sin estado";

  // Evitamos mostrar valores vacíos en la información general.
  const tipoAlimento =
    food.tipo_alimento === "compuesto" ? "Compuesto" : "Simple";

  const nombreNutricionista = [
    nutricionista?.nombre,
    nutricionista?.apellidos,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="mx-auto max-w-7xl space-y-6 pb-8">
      {/* Navegación y acción principal */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 px-2"
        >
          <span aria-hidden="true">←</span>
          Volver a alimentos
        </Button>

        {puedeEditar && (
          <Button variant="health" onClick={handleEditar}>
            Editar alimento
          </Button>
        )}
      </div>

      {/* Encabezado principal */}
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-health-600">
              Catálogo de alimentos / Detalles
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-words text-2xl font-bold tracking-tight text-health-700 sm:text-3xl">
                {food.nombre_alimento}
              </h1>

              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${estiloEstado}`}
              >
                <span
                  className="mr-2 h-1.5 w-1.5 rounded-full bg-current"
                  aria-hidden="true"
                />
                {estadoFormateado}
              </span>
            </div>

            <p className="text-sm leading-6 text-content-muted">
              Consulta las características, los grupos nutricionales
              y la información de validación de este alimento.
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 sm:min-w-32">
            <p className="text-xs font-medium text-content-muted">
              Identificador
            </p>

            <p className="mt-1 text-2xl font-bold text-content">
              #{food.id_alimento}
            </p>
          </div>
        </div>
      </header>

      {/* Información general */}
      <Card className="border border-gray-200 shadow-sm">
        <SectionHeading
          title="Información general"
          description="Características principales del alimento registrado."
        />

        <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Tipo de alimento"
            value={tipoAlimento}
          />

          <InfoItem
            label="Preparación"
            value={food.tipo_preparacion || "No especificada"}
          />

          <InfoItem
            label="Nivel calórico"
            value={food.nivel_calorico || "No especificado"}
          />

          <InfoItem
            label="Identificador"
            value={`#${food.id_alimento}`}
          />
        </div>
      </Card>

      {/* Ingredientes de los alimentos compuestos */}
      {food.tipo_alimento === "compuesto" && (
        <Card className="border border-gray-200 shadow-sm">
          <SectionHeading
            title="Ingredientes"
            description="Alimentos que componen este plato y las cantidades utilizadas."
          />

          {ingredientes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center">
              <p className="font-medium text-content">
                Sin ingredientes registrados
              </p>

              <p className="mt-1 text-sm text-content-muted">
                Todavía no se han asociado ingredientes a este plato.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              {ingredientes.map((ingrediente, index) => (
                <div
                  key={ingrediente.id_alimento_ingrediente}
                  className={`flex items-center justify-between gap-4 p-4 ${
                    index !== ingredientes.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-health-700">
                      <span aria-hidden="true">◈</span>
                    </div>

                    <h3 className="break-words font-medium text-content">
                      {ingrediente.nombre_alimento}
                    </h3>
                  </div>

                  <span className="shrink-0 rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-content">
                    {ingrediente.cantidad} {ingrediente.unidad_medida}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Grupos nutricionales */}
      <Card className="border border-gray-200 shadow-sm">
        <SectionHeading
          title="Grupos nutricionales"
          description="Clasificación nutricional asociada a este alimento."
        />

        {grupos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center">
            <p className="font-medium text-content">
              Sin grupos nutricionales
            </p>

            <p className="mt-1 text-sm text-content-muted">
              Todavía no hay grupos asociados a este alimento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grupos.map((grupo) => (
              <article
                key={grupo.id_grupo}
                className="rounded-xl border border-gray-200 p-5 transition-colors hover:border-health-500"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-health-700">
                  <span className="text-lg" aria-hidden="true">
                    ◈
                  </span>
                </div>

                <h3 className="font-semibold text-content">
                  {grupo.nombre_grupo}
                </h3>

                <p className="mt-2 text-sm leading-6 text-content-muted">
                  {grupo.descripcion || "Sin descripción disponible."}
                </p>
              </article>
            ))}
          </div>
        )}
      </Card>

      {/* Validación del alimento */}
      <Card className="border border-gray-200 shadow-sm">
        <SectionHeading
          title="Validación del alimento"
          description="Estado de la revisión realizada por el jefe de nutrición."
        />

        <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Estado actual"
            value={estadoFormateado}
          />

          <InfoItem
            label="Resultado de validación"
            value={food.resultado_val_alimento ?? "Sin validar"}
          />

          <InfoItem
            label="Fecha de validación"
            value={food.fecha_validacion_alimento ?? "Pendiente"}
          />
        </div>

        {/* Observaciones del jefe de nutrición */}
        <div className="mt-5">
          {food.observaciones?.trim() ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <span
                    className="text-lg font-bold"
                    aria-hidden="true"
                  >
                    !
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-amber-900">
                    Observaciones del jefe de nutrición
                  </h3>

                  <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-amber-900">
                    {food.observaciones}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 p-4">
              <p className="text-sm text-content-muted">
                No hay observaciones registradas para este alimento.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Registro y autoría */}
      <Card className="border border-gray-200 shadow-sm">
        <SectionHeading
          title="Registro del alimento"
          description="Información sobre el profesional que creó el registro."
        />

        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-health-700">
            {nutricionista?.nombre?.charAt(0)?.toUpperCase() ?? "N"}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-content-muted">
              Nutricionista creador
            </p>

            <p className="mt-1 break-words font-semibold text-content">
              {nombreNutricionista || "Usuario no disponible"}
            </p>

            <p className="mt-1 text-sm text-content-muted">
              ID de usuario: {food.id_usuario_creador ?? "—"}
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
};
