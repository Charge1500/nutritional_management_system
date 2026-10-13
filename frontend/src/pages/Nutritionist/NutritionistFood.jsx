
import { obtenerAlimentos } from "../../services/foodService";
import { FoodCard } from "../../components/nutritionist/FoodCard";
import { Button } from "../../components/Button";
import { useNavigate } from "react-router-dom";

export const NutritionistFood = () => {
  // Obtenemos los alimentos desde el servicio.
  const alimentos = obtenerAlimentos();

  const navigate = useNavigate();
   const registrarAlimento = () => {
    navigate(`/nutricionista/alimentos/nuevo`);
  };

  return (
    <section className="space-y-6">
      {/* Encabezado de la página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-health-700">
            Alimentos
          </h1>

          <p className="mt-1 text-sm text-content-muted">
            Consulta los alimentos disponibles para crear menús nutricionales.
          </p>
        </div>

        <Button
          variant="food"
          onClick={ registrarAlimento}
        >
          + Registrar alimento
        </Button>
      </div>

      {/* Resumen de alimentos */}
      <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-soft">
        <p className="text-sm text-content-muted">
          Total de alimentos registrados
        </p>

        <p className="mt-1 text-2xl font-bold text-content">
          {alimentos.length}
        </p>
      </div>

      {/* Listado de alimentos */}
      {alimentos.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {alimentos.map((food) => (
            <FoodCard
              key={food.id_alimento}
              food={food}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-surface px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-content">
            No hay alimentos registrados
          </h2>

          <p className="mt-2 text-sm text-content-muted">
            Cuando haya alimentos disponibles, aparecerán en esta sección.
          </p>
        </div>
      )}
    </section>
  );
};
