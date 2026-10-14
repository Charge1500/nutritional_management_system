
import { useParams, useNavigate } from "react-router-dom";

import { obtenerMenuPorId } from "../../services/menuService";
import {
  obtenerDietaPorId,
  obtenerGruposDeDieta,
} from "../../services/dietService";
import { obtenerUsuarioPorId } from "../../services/userService";

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

  return (
    <section className="space-y-6">
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
            <p className="text-xs text-content-muted">
              Tipo de comida
            </p>

            <p className="mt-1 font-medium capitalize text-content">
              {menu.tipo_comida || "No especificado"}
            </p>
          </div>

          <div>
            <p className="text-xs text-content-muted">
              Fecha de creación
            </p>

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
            <p className="text-xs text-content-muted">
              Dieta asociada
            </p>

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
              <p className="text-xs text-content-muted">
                Estado actual
              </p>

              <div className="mt-2">
                <Badge status={menu.estado_menu} />
              </div>
            </div>

            <div>
              <p className="text-xs text-content-muted">
                Fecha de validación
              </p>

              <p className="mt-1 text-sm font-medium text-content">
                {menu.fecha_validacion ||
                  "Pendiente de validación"}
              </p>
            </div>

            <div>
              <p className="text-xs text-content-muted">
                Observaciones
              </p>

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
