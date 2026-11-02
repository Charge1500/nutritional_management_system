
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerGruposConCantidadAlimentos } from "../../../services/foodService";
import { GroupCard } from "../../../components/Head/GroupCard";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";

export const NutritionGroups = () => {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);

  useEffect(() => {
    const gruposObtenidos = obtenerGruposConCantidadAlimentos();
    setGrupos(gruposObtenidos);
  }, []);

  const totalAlimentos = grupos.reduce(
    (total, grupo) => total + grupo.cantidadAlimentos,
    0
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content">
            Grupos nutricionales
          </h1>
          <p className="mt-1 text-sm text-content-muted">
            Administra los grupos nutricionales y consulta los alimentos
            asociados a cada uno.
          </p>
        </div>

        <Button onClick={() => navigate("/jefe/grupos/nuevo")}>
          Crear grupo
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="text-sm text-content-muted">
            Total de grupos
          </p>
          <p className="mt-1 text-2xl font-bold text-content">
            {grupos.length}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-content-muted">
            Alimentos asociados
          </p>
          <p className="mt-1 text-2xl font-bold text-content">
            {totalAlimentos}
          </p>
        </Card>
      </div>

      {/* Listado de grupos */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-content">
            Grupos registrados
          </h2>
          <p className="text-sm text-content-muted">
            Selecciona un grupo para consultar sus detalles.
          </p>
        </div>

        {grupos.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {grupos.map((grupo) => (
              <GroupCard
                key={grupo.id_grupo_nutricional}
                group={grupo}
                cantidadAlimentos={grupo.cantidadAlimentos}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <h3 className="font-semibold text-content">
              No hay grupos nutricionales registrados
            </h3>
            <p className="mt-2 text-sm text-content-muted">
              Puedes comenzar creando un nuevo grupo nutricional.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
};
