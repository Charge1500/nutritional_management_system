
import { useParams, useNavigate } from "react-router-dom";

import { obtenerMenuPorId } from "../../services/menuService";
import {
  obtenerDietaPorId,
  obtenerGruposDeDieta,
} from "../../services/dietService";
import {
  obtenerAlimentoPorId,
  obtenerGruposDeAlimento,
} from "../../services/foodService";
import { obtenerUsuarioPorId } from "../../services/userService";

import { contenidoMenuAlimento } from "../../data/mockData";

import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";

// Página que muestra los detalles de un menú nutricional.
export const MenuDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Obtenemos la información del menú.
  const menu = obtenerMenuPorId(id);

  // Si el menú no existe, mostramos un mensaje.
  if (!menu) {
    return (
      <section className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-health-700">
            Menú no encontrado
          </h1>

          <p className="mt-2 text-sm text-content-muted">
            No se encontró el menú solicitado.
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </section>
    );
  }

  // Obtenemos los datos relacionados con el menú.
  const creador = obtenerUsuarioPorId(menu.id_usuario_creador);
  const dieta = obtenerDietaPorId(menu.id_dieta);
  const grupos = dieta ? obtenerGruposDeDieta(dieta.id_dieta) : [];

  // Obtenemos los alimentos que pertenecen a este menú.
  const alimentosMenu = contenidoMenuAlimento.filter(
    (contenido) => contenido.id_menu === Number(menu.id_menu)
  );

  return (
    <section className="space-y-6">
      {/* Botón para volver */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 px-2"
        >
          <span aria-hidden="true">←</span>
          Volver a menús
        </Button>
      </div>

      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-content-muted">
            Gestión de menús / Detalles
          </p>

          <h1 className="mt-2 break-words text-2xl font-bold text-health-700 sm:text-3xl">
            {menu.nombre_menu}
          </h1>

          <p className="mt-2 text-sm capitalize text-content-muted">
            {menu.tipo_comida || "Tipo de comida no especificado"}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <span className="text-xs text-content-muted">
            #{menu.id_menu}
          </span>

          <Badge status={menu.estado_menu} />
        </div>
      </div>

      {/* Información general */}
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-health-700">
            Información general
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-5 border-t border-gray-100 pt-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-content-muted">Tipo de comida</p>

            <p className="mt-1 font-medium capitalize text-content">
              {menu.tipo_comida || "No especificado"}
            </p>
          </div>

          <div>
            <p className="text-xs text-content-muted">Fecha de creación</p>

            <p className="mt-1 font-medium text-content">
              {menu.fecha_creacion || "No especificada"}
            </p>
          </div>

          <div>
            <p className="text-xs text-content-muted">
              Nutricionista creador
            </p>

            <p className="mt-1 font-medium text-content">
              {creador
                ? `${creador.nombre} ${creador.apellidos}`
                : "No disponible"}
            </p>
          </div>

          <div>
            <p className="text-xs text-content-muted">Dieta asociada</p>

            <p className="mt-1 font-medium text-content">
              {dieta?.nombre_dieta || "No disponible"}
            </p>
          </div>
        </div>
      </Card>

      {/* Grupos nutricionales de la dieta */}
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-health-700">
            Grupos nutricionales
          </h2>

          <p className="mt-1 text-sm text-content-muted">
            Grupos que debe cubrir la dieta asociada a este menú.
          </p>
        </div>

        {grupos.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-5">
            {grupos.map((grupo) => (
              <span
                key={grupo.id_grupo_nutricional}
                className="rounded-full bg-health-50 px-3 py-1.5 text-sm font-medium text-health-700"
              >
                {grupo.nombre_grupo}
              </span>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-background p-4 text-sm text-content-muted">
            No hay grupos nutricionales asociados a esta dieta.
          </p>
        )}
      </Card>

      {/* Alimentos que componen el menú */}
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-health-700">
            Alimentos del menú
          </h2>

          <p className="mt-1 text-sm text-content-muted">
            Alimentos incluidos y cantidades necesarias para cada uno.
          </p>
        </div>

        {alimentosMenu.length > 0 ? (
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {alimentosMenu.map((contenido, index) => {
              // Buscamos la información completa del alimento.
              const alimento = obtenerAlimentoPorId(
                contenido.id_alimento
              );

              // Obtenemos los grupos nutricionales del alimento.
              const gruposAlimento = obtenerGruposDeAlimento(
                contenido.id_alimento
              );

              // Evitamos mostrar relaciones con alimentos inexistentes.
              if (!alimento) return null;

              return (
                <div
                  key={`${contenido.id_menu}-${contenido.id_alimento}-${index}`}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium text-content">
                      {alimento.nombre_alimento}
                    </h3>

                    {gruposAlimento.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {gruposAlimento.map((grupo) => (
                          <span
                            key={grupo.id_grupo_nutricional}
                            className="rounded-full bg-health-50 px-2.5 py-1 text-xs font-medium text-health-700"
                          >
                            {grupo.nombre_grupo}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-content-muted">
                        Sin grupos nutricionales registrados.
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 rounded-lg bg-background px-4 py-2 sm:text-right">
                    <p className="font-semibold text-content">
                      {contenido.cantidad} {contenido.unidad_medida}
                    </p>

                    <p className="text-xs text-content-muted">
                      Cantidad
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg bg-background p-4 text-sm text-content-muted">
            Este menú todavía no tiene alimentos registrados.
          </p>
        )}
      </Card>

      {/* Validación y preparación */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-health-700">
              Validación
            </h2>

            <p className="mt-1 text-sm text-content-muted">
              Estado y seguimiento de la revisión del menú.
            </p>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-5">
            <div>
              <p className="text-xs text-content-muted">Estado actual</p>

              <div className="mt-2">
                <Badge status={menu.estado_menu} />
              </div>
            </div>

            <div>
              <p className="text-xs text-content-muted">
                Fecha de validación
              </p>

              <p className="mt-1 text-sm font-medium text-content">
                {menu.fecha_validacion || "Pendiente de validación"}
              </p>
            </div>

            <div>
              <p className="text-xs text-content-muted">Observaciones</p>

              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-content">
                {menu.observaciones || "Sin observaciones"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-health-700">
              Proporción de preparación
            </h2>

            <p className="mt-1 text-sm text-content-muted">
              Indicaciones registradas para preparar el menú.
            </p>
          </div>

          <p className="border-t border-gray-100 pt-5 text-sm leading-relaxed text-content">
            {menu.proporcion_preparacion ||
              "No se han especificado indicaciones de preparación."}
          </p>
        </Card>
      </div>
    </section>
  );
};
