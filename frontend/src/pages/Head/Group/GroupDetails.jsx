
import { useNavigate, useParams } from "react-router-dom";

import { obtenerAlimentosDeGrupo } from "../../../services/nutritionalGroupService";
import { obtenerGrupoPorId } from "../../../services/nutritionalGroupService";
import { Card } from "../../../components/Card";

export const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Obtenemos los datos directamente a partir del ID de la ruta.
  const grupo = obtenerGrupoPorId(id);
  const alimentos = obtenerAlimentosDeGrupo(id);

  if (!grupo) {
    return (
      <Card className="p-6 text-center">
        <h2 className="font-semibold text-content">
          Grupo no encontrado
        </h2>
        <button
          onClick={() => navigate("/jefe/grupos")}
          className="mt-4 text-sm font-medium text-health-600 hover:underline"
        >
          Volver a los grupos
        </button>
      </Card>
    );
  }

  const puedeEditar = alimentos.length === 0;

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <button
        onClick={() => navigate("/jefe/grupos")}
        className="text-sm font-medium text-health-600 hover:underline"
      >
        ← Volver a grupos nutricionales
      </button>

      {/* Información del grupo */}
      <Card className="space-y-5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-health-600">
              Grupo nutricional
            </p>

            <h1 className="mt-1 text-2xl font-bold text-content">
              {grupo.nombre_grupo}
            </h1>

            <p className="mt-2 text-sm text-content-muted">
              {grupo.descripcion || "Sin descripción disponible."}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
              grupo.estado_grupo === "guardado"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {grupo.estado_grupo === "guardado"
              ? "Guardado"
              : "Borrador"}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
          <div>
            <p className="text-sm text-content-muted">
              Alimentos asociados
            </p>
            <p className="text-2xl font-bold text-content">
              {alimentos.length}
            </p>
          </div>

          <button
            type="button"
            disabled={!puedeEditar}
            onClick={() =>
              navigate(`/jefe/grupos/nuevo?id=${grupo.id_grupo_nutricional}`)
            }
            title={
              puedeEditar
                ? "Editar grupo"
                : "No se puede editar porque tiene alimentos asociados"
            }
            className="rounded-lg bg-health-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-health-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Editar grupo
          </button>
        </div>
      </Card>

      {/* Alimentos asociados */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-content">
            Alimentos del grupo
          </h2>
          <p className="text-sm text-content-muted">
            Listado de alimentos que pertenecen a {grupo.nombre_grupo}.
          </p>
        </div>

        {alimentos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {alimentos.map((alimento) => (
              <Card
                key={alimento.id_alimento}
                className="space-y-3 p-4"
              >
                <div>
                  <h3 className="font-semibold text-content">
                    {alimento.nombre}
                  </h3>

                  <p className="mt-1 text-sm text-content-muted">
                    {alimento.tipo_alimento}
                  </p>
                </div>

                <div className="space-y-1 border-t border-border pt-3 text-sm">
                  <p className="text-content-muted">
                    Preparación:{" "}
                    <span className="text-content">
                      {alimento.tipo_preparacion || "No especificada"}
                    </span>
                  </p>

                  <p className="text-content-muted">
                    Nivel calórico:{" "}
                    <span className="text-content">
                      {alimento.nivel_calorico || "No especificado"}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/nutricionista/alimentos/${alimento.id_alimento}`)
                  }
                  className="text-sm font-medium text-health-600 hover:underline"
                >
                  Ver alimento →
                </button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <h3 className="font-semibold text-content">
              Este grupo no tiene alimentos asociados
            </h3>
            <p className="mt-2 text-sm text-content-muted">
              Puedes modificar la información del grupo.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
};
