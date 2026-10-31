import { useNavigate } from "react-router-dom";
import { Card } from "../Card";

export const GroupCard = ({ group, cantidadAlimentos }) => {
  const navigate = useNavigate();

  // Un grupo solo puede modificarse si no tiene alimentos asociados.
  const puedeEditar = cantidadAlimentos === 0;

  return (
    <Card className="flex h-full flex-col gap-4">

      {/* Información principal del grupo */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-content">
            {group.nombre_grupo}
          </h3>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              group.estado_grupo === "guardado"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {group.estado_grupo === "guardado"
              ? "Guardado"
              : "Borrador"}
          </span>
        </div>

        <p className="mt-2 text-sm text-content-muted">
          {group.descripcion}
        </p>
      </div>

      {/* Cantidad de alimentos asociados */}
      <div className="flex items-center gap-2 rounded-lg bg-surface-secondary p-3">
        <span className="text-health-500" aria-hidden="true">
          <span className="text-lg">◈</span>
        </span>

        <span className="text-sm text-content">
          {cantidadAlimentos}{" "}
          {cantidadAlimentos === 1
            ? "alimento asociado"
            : "alimentos asociados"}
        </span>
      </div>

      {/* Acciones */}
      <div className="mt-auto flex flex-wrap gap-2">

        <button
          type="button"
          onClick={() =>
            navigate(`/jefe/grupos/${group.id_grupo_nutricional}`)
          }
          className="flex-1 rounded-lg border border-health-500 px-3 py-2 text-sm font-medium text-health-600 transition hover:bg-health-500/10"
        >
          Ver detalles
        </button>

        <button
          type="button"
          disabled={!puedeEditar}
          onClick={() =>
            navigate(
              `/jefe/grupos/${group.id_grupo_nutricional}/editar`
            )
          }
          className="flex-1 rounded-lg bg-health-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-health-600 disabled:cursor-not-allowed disabled:opacity-40"
          title={
            puedeEditar
              ? "Editar grupo"
              : "No se puede editar porque tiene alimentos asociados"
          }
        >
          Editar
        </button>

      </div>
    </Card>
  );
};