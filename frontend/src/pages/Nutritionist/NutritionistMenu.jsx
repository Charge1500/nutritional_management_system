
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { obtenerMenus } from "../../services/menuService";
import { MenuCard } from "../../components/nutritionist/MenuCard";
import { Button } from "../../components/Button";

export const NutritionistMenu = () => {
  const navigate = useNavigate();

  // Obtener todos los menús registrados.
  const menus = obtenerMenus();

  // Sustituir por el ID del nutricionista autenticado.
  const ID_NUTRICIONISTA = 1;

  // Filtro seleccionado.
  const [filtro, setFiltro] = useState("todos");

  const crearMenu = () => {
    navigate("/nutricionista/menus/nuevo");
  };

  // Filtrar los menús según su creador.
  const menusFiltrados =
    filtro === "propios"
      ? menus.filter(
          (menu) =>
            Number(menu.id_usuario_creador) === ID_NUTRICIONISTA
        )
      : menus;

  return (
    <section className="space-y-6">
      {/* Encabezado de la página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-health-700">
            Menús
          </h1>

          <p className="mt-1 text-sm text-content-muted">
            Consulta los menús disponibles y los que has creado.
          </p>
        </div>

        <Button variant="food" onClick={crearMenu}>
          + Generar menú
        </Button>
      </div>

      {/* Resumen */}
      <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-soft">
        <p className="text-sm text-content-muted">
          {filtro === "propios"
            ? "Total de menús creados por ti"
            : "Total de menús registrados"}
        </p>

        <p className="mt-1 text-2xl font-bold text-content">
          {menusFiltrados.length}
        </p>
      </div>

      {/* Filtro de menús */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-content">
          Listado de menús
        </h2>

        <div className="flex gap-2 rounded-lg bg-background p-1">
          <button
            type="button"
            onClick={() => setFiltro("todos")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              filtro === "todos"
                ? "bg-surface text-health-700 shadow-sm"
                : "text-content-muted hover:text-content"
            }`}
          >
            Todos los menús
          </button>

          <button
            type="button"
            onClick={() => setFiltro("propios")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              filtro === "propios"
                ? "bg-surface text-health-700 shadow-sm"
                : "text-content-muted hover:text-content"
            }`}
          >
            Mis menús
          </button>
        </div>
      </div>

      {/* Listado filtrado */}
      {menusFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {menusFiltrados.map((menu) => (
            <MenuCard key={menu.id_menu} menu={menu} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-surface px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-content">
            {filtro === "propios"
              ? "Todavía no has creado menús"
              : "No hay menús registrados"}
          </h2>

          <p className="mt-2 text-sm text-content-muted">
            {filtro === "propios"
              ? "Cuando generes un menú, aparecerá en esta sección."
              : "Cuando haya menús disponibles, aparecerán en esta sección."}
          </p>
        </div>
      )}
    </section>
  );
};
