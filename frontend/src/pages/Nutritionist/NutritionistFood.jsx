import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { obtenerAlimentos } from "../../services/foodService";
import { FoodCard } from "../../components/nutritionist/FoodCard";
import { Button } from "../../components/Button";

export const NutritionistFood = () => {
  // Obtenemos los alimentos desde el servicio.
  const alimentos = obtenerAlimentos();

  const navigate = useNavigate();

  // TODO: Sustituir por el ID del nutricionista autenticado.
  const ID_NUTRICIONISTA = 1;

  // Controla qué alimentos se muestran.
  const [filtro, setFiltro] = useState("todos");

  // Navega al formulario para registrar un alimento.
  const registrarAlimento = () => {
    navigate("/nutricionista/alimentos/nuevo");
  };

  // Filtramos los alimentos según el criterio seleccionado.
  const alimentosFiltrados =
    filtro === "propios"
      ? alimentos.filter(
        (alimento) =>
          Number(alimento.id_usuario_creador) === ID_NUTRICIONISTA
      )
      : alimentos;

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

        <Button variant="food" onClick={registrarAlimento}>
          + Registrar alimento
        </Button>
      </div>



      {/* Resumen de alimentos */}
      <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-soft">
        <p className="text-sm text-content-muted">
          {filtro === "todos"
            ? "Total de alimentos registrados"
            : "Alimentos registrados por mí"}
        </p>

        <p className="mt-1 text-2xl font-bold text-content">
          {alimentosFiltrados.length}
        </p>
      </div>



      {/* Filtro de alimentos */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-content">
          Listado de alimentos
        </h2>

        <div className="flex gap-2 rounded-lg bg-background p-1">
          <button
            type="button"
            onClick={() => setFiltro("todos")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${filtro === "todos"
                ? "bg-surface text-health-700 shadow-sm"
                : "text-content-muted hover:text-content"
              }`}
          >
            Todos los alimentos
          </button>

          <button
            type="button"
            onClick={() => setFiltro("propios")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${filtro === "propios"
                ? "bg-surface text-health-700 shadow-sm"
                : "text-content-muted hover:text-content"
              }`}
          >
            Mis alimentos
          </button>
        </div>
      </div>


      {/* Listado de alimentos */}
      {alimentosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {alimentosFiltrados.map((food) => (
            <FoodCard key={food.id_alimento} food={food} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-surface px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-content">
            {filtro === "propios"
              ? "No has registrado alimentos"
              : "No hay alimentos registrados"}
          </h2>

          <p className="mt-2 text-sm text-content-muted">
            {filtro === "propios"
              ? "Los alimentos que registres aparecerán en esta sección."
              : "Cuando haya alimentos disponibles, aparecerán en esta sección."}
          </p>
        </div>
      )}
    </section>
  );
};