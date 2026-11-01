
import { useNavigate } from "react-router-dom";

import { obtenerTodasLasDietas } from "../../services/dietService";
import { DietCard } from "../../components/nutritionist/DietCard";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

export const Diets = () => {
  const navigate = useNavigate();

  const dietas=obtenerTodasLasDietas();


 
  const dietasGuardadas = dietas.filter(
    (dieta) => dieta.estado_dieta === "guardado"
  ).length;

  const dietasBorrador = dietas.filter(
    (dieta) => dieta.estado_dieta === "borrador"
  ).length;

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content">
            Dietas nutricionales
          </h1>

          <p className="mt-1 text-sm text-content-muted">
            Gestiona las dietas y sus restricciones nutricionales.
          </p>
        </div>

        <Button
          variant="health"
          onClick={() => navigate("/jefe/dietas/nueva")}
        >
          + Crear dieta
        </Button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-content-muted">
            Total de dietas
          </p>
          <p className="mt-1 text-2xl font-bold text-content">
            {dietas.length}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-content-muted">
            Guardadas
          </p>
          <p className="mt-1 text-2xl font-bold text-content">
            {dietasGuardadas}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-content-muted">
            Borradores
          </p>
          <p className="mt-1 text-2xl font-bold text-content">
            {dietasBorrador}
          </p>
        </Card>
      </div>

      {/* Listado de dietas */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-content">
          Todas las dietas
        </h2>

        {dietas.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {dietas.map((dieta) => (
              <DietCard
                key={dieta.id_dieta}
                diet={dieta}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <h3 className="font-semibold text-content">
              No hay dietas registradas
            </h3>

            <p className="mt-2 text-sm text-content-muted">
              Puedes crear una nueva dieta para comenzar.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
};
