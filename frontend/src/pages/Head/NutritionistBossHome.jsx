
import { useNavigate } from "react-router-dom";

import { obtenerResumenJefeNutricion } from "../../services/facades/nutritionistBossFecade";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";

export const NutritionistBossHome = () => {
  const navigate = useNavigate();

  const {
  menus,
  dietas,
  grupos,
  alimentos,
  pendientes,
  aprobados,
  rechazados,
} = obtenerResumenJefeNutricion();

 
  const estadisticas = [
    {
      titulo: "Total de menús",
      cantidad: menus.length,
      descripcion: "Menús registrados",
    },
    {
      titulo: "Pendientes",
      cantidad: pendientes.length,
      descripcion: "Requieren revisión",
    },
    {
      titulo: "Aprobados",
      cantidad: aprobados.length,
      descripcion: "Menús validados",
    },
    {
      titulo: "Rechazados",
      cantidad: rechazados.length,
      descripcion: "Necesitan correcciones",
    },
  ];

  return (
    <section className="space-y-8">

      {/* Encabezado */}
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-content-muted">
          Panel de administración
        </p>

        <h1 className="mt-2 text-2xl font-bold text-health-700 sm:text-3xl">
          Inicio
        </h1>

        <p className="mt-2 text-sm text-content-muted">
          Gestiona los menús nutricionales y supervisa
          su proceso de validación.
        </p>
      </header>

      {/* Resumen general */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-health-700">
          Resumen general
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {estadisticas.map((estadistica) => (
            <Card
              key={estadistica.titulo}
              className="space-y-3"
            >
              <p className="text-sm text-content-muted">
                {estadistica.titulo}
              </p>

              <p className="text-3xl font-bold text-health-700">
                {estadistica.cantidad}
              </p>

              <p className="text-xs text-content-muted">
                {estadistica.descripcion}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Menús pendientes */}
      <Card className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-health-700">
              Menús pendientes de aprobación
            </h2>

            <p className="mt-1 text-sm text-content-muted">
              Revisa los menús enviados por los nutricionistas.
            </p>
          </div>

          <Badge status="pendiente" />
        </div>

        {pendientes.length > 0 ? (
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {pendientes.map((menu) => (
              <div
                key={menu.id_menu}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="font-medium text-content">
                    {menu.nombre_menu}
                  </h3>

                  <p className="mt-1 text-sm capitalize text-content-muted">
                    {menu.tipo_comida || "Tipo de comida no especificado"}
                  </p>

                  <p className="mt-1 text-xs text-content-muted">
                    Creado el{" "}
                    {menu.fecha_creacion || "fecha no disponible"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Badge status={menu.estado_menu} />

                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(
                        `/nutricionista/menus/${menu.id_menu}`
                      )
                    }
                  >
                    Revisar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-background p-6 text-center">
            <p className="font-medium text-content">
              No hay menús pendientes
            </p>

            <p className="mt-1 text-sm text-content-muted">
              Todos los menús registrados han sido revisados.
            </p>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <Button
            variant="health"
            onClick={() => navigate("/nutricionista/menus")}
          >
            Ver todos los menús
          </Button>
        </div>
      </Card>

      {/* Accesos rápidos */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-health-700">
          Gestión nutricional
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="space-y-3">
            <h3 className="font-semibold text-content">
              Dietas
            </h3>

            <p className="text-sm text-content-muted">
              Consulta las dietas registradas y administra
              sus restricciones.
            </p>

            <p className="text-sm font-medium text-health-700">
              {dietas.length} dietas registradas
            </p>

            <Button
              variant="outline"
              onClick={() => navigate("/jefe/dietas")}
            >
              Gestionar dietas
            </Button>
          </Card>


          <Card className="space-y-3">
            <h3 className="font-semibold text-content">
              Grupos nutricionales
            </h3>

            <p className="text-sm text-content-muted">
              Organiza los grupos nutricionales utilizados
              en alimentos y dietas.
            </p>
            <p className="text-sm font-medium text-health-700">
              {grupos.length} grupos nutricionales registrados
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/jefe/grupos")}
            >
              Gestionar grupos
            </Button>
          </Card>

          <Card className="space-y-3">
            <h3 className="font-semibold text-content">
              Alimentos
            </h3>

            <p className="text-sm text-content-muted">
              Revisa los alimentos registrados
            </p>
            <p className="text-sm font-medium text-health-700">
              {alimentos.length} aliemntos registrados
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/nutricionista/alimentos")}
            >
              Gestionar alimentos
            </Button>
          </Card>

        </div>
      </div>

    </section>
  );
};
