
import {obtenerMenus} from "../../services/menuService";
import { MenuCard } from "../../components/nutritionist/MenuCard";
import { Button } from "../../components/Button";
import { useNavigate } from "react-router-dom";

export const NutritionistMenu = () => {
  // Obtenemos los alimentos desde el servicio.
  const menus = obtenerMenus();

  const navigate = useNavigate();
   const crearMenu = () => {
    navigate(`/nutricionista/menus/nuevo`);
  };

  return (
    <section className="space-y-6">
      {/* Encabezado de la página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-health-700">
            Menus
          </h1>

        </div>

        <Button
          variant="food"
          onClick={ crearMenu}
        >
          + Generar Menu
        </Button>
      </div>

      {/* Resumen de Menus */}
      <div className="rounded-xl border border-gray-100 bg-surface p-4 shadow-soft">
        <p className="text-sm text-content-muted">
          Total de menus registrados
        </p>

        <p className="mt-1 text-2xl font-bold text-content">
          {menus.length}
        </p>
      </div>

      {/* Listado de alimentos */}
      {menus.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {menus.map((menu) => (
            <MenuCard
              menu={menu}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-surface px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-content">
            No hay menus registrados
          </h2>

          <p className="mt-2 text-sm text-content-muted">
            Cuando haya menus disponibles, aparecerán en esta sección.
          </p>
        </div>
      )}
    </section>
  );
};
