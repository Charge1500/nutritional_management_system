// src/pages/Patient/MisMenus.jsx
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  obtenerMenusAsignados,
  obtenerAlimentosDeMenu,
} from "../../services/menuService";
import { Card } from "../../components/Card";

export const MisMenus = () => {
  const { user } = useAuth();

  // Estado para el menú expandido (null = ninguno expandido).
  const [expandedMenuId, setExpandedMenuId] = useState(null);

  // Si no hay usuario, mostramos un aviso.
  if (!user) {
    return (
      <Card>
        <p className="text-sm text-content-muted">No se encontró el usuario.</p>
      </Card>
    );
  }

  // Obtenemos los menús asignados al paciente.
  const asignaciones = obtenerMenusAsignados(user.id_usuario);

  const toggleExpanded = (idAsignacion) => {
    setExpandedMenuId((current) =>
      current === idAsignacion ? null : idAsignacion
    );
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-content">Mis menús</h1>
        <p className="mt-1 text-sm text-content-muted">
          Consulta el detalle de los menús que te fueron asignados.
        </p>
      </header>

      {asignaciones.length === 0 ? (
        <Card className="py-10 text-center">
          <p className="text-sm text-content-muted">
            Todavía no tienes menús asignados.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {asignaciones.map((asignacion) => {
            const { id_asignacion, menu, dieta, fecha_asignacion, estado_asignacion } =
              asignacion;

            if (!menu) return null;

            const alimentos = obtenerAlimentosDeMenu(menu.id_menu);
            const isExpanded = expandedMenuId === id_asignacion;
            const estaConsumido = estado_asignacion === "consumido";

            return (
              <Card key={id_asignacion} className="space-y-3">
                {/* Cabecera: nombre, dieta y estado */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-content">
                      {menu.nombre_menu}
                    </h2>
                    {dieta && (
                      <p className="mt-1 text-sm text-content-muted">
                        Dieta: {dieta.nombre_dieta} — {dieta.programa}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-content-muted">
                      Asignado el {fecha_asignacion}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      estaConsumido
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {estaConsumido ? "Consumido" : "Pendiente"}
                  </span>
                </div>

                {/* Botón para expandir/colapsar */}
                <button
                  type="button"
                  onClick={() => toggleExpanded(id_asignacion)}
                  className="text-sm font-medium text-health-600 hover:text-health-700 transition-colors"
                >
                  {isExpanded ? "Ocultar detalle ▲" : "Ver detalle ▼"}
                </button>

                {/* Detalle expandido */}
                {isExpanded && (
                  <div className="space-y-4 border-t border-gray-100 pt-4">
                    {/* Información del menú */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-content-muted">
                          Tipo de comida
                        </p>
                        <p className="mt-1 text-sm text-content">
                          {menu.tipo_comida || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-content-muted">
                          Estado del menú
                        </p>
                        <p className="mt-1 text-sm text-content">
                          {menu.estado_menu}
                        </p>
                      </div>
                    </div>

                    {/* Proporción de preparación */}
                    {menu.proporcion_preparacion && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-content-muted">
                          Preparación
                        </p>
                        <p className="mt-1 text-sm text-content">
                          {menu.proporcion_preparacion}
                        </p>
                      </div>
                    )}

                    {/* Alimentos con cantidad */}
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-content-muted">
                        Alimentos del menú
                      </p>
                      <ul className="mt-2 space-y-2">
                        {alimentos.map((alimento) => (
                          <li
                            key={alimento.id_alimento}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm"
                          >
                            <div>
                              <span className="font-medium text-content">
                                {alimento.nombre_alimento}
                              </span>
                              <span className="ml-2 text-xs text-content-muted">
                                ({alimento.tipo_preparacion} — nivel{" "}
                                {alimento.nivel_calorico})
                              </span>
                            </div>
                            <span className="text-content-muted">
                              {alimento.cantidad} {alimento.unidad_medida}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};