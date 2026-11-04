
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../data/roles";

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import { validarMenu } from "../../services/menuService";
import { obtenerDetallesMenu } from "../../services/facades/menusFacade";


import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import{obtenerUsuarioPorId} from "../../services/userService"

// Página que muestra los detalles de un menú nutricional.
export const MenuDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mostrarObservaciones, setMostrarObservaciones] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [errorObservaciones, setErrorObservaciones] = useState("");

  // Verificamos el rol del usuario actual.
  const usuarioActual = user
    ? obtenerUsuarioPorId(user.id_usuario)
    : null;

  const esJefe = usuarioActual?.rol === ROLES.JEFE;

  // Obtenemos la información del menú.
  const detalles = obtenerDetallesMenu(id)
  // Si el menú no existe, mostramos un mensaje.
  if (!detalles) {
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

const {
  menu,
  creador,
  dieta,
  grupos,
  alimentos
} = detalles;

const esPendiente = menu.estado_menu === "pendiente";
alimentos.map((contenido) => console.log(contenido))

  // Aprobar menú.
  const aprobarMenu = () => {
    // Solo el jefe puede aprobar menús pendientes.
    if (!esJefe || !esPendiente) return;

    const actualizado = validarMenu(
      menu.id_menu,
      "aprobado"
    );

    if (actualizado) {
      navigate("/jefe/menus");
    }
  };

  // Rechazar menú.
  const rechazarMenu = () => {
    // Solo el jefe puede rechazar menús pendientes.
    if (!esJefe || !esPendiente) return;

    const motivo = observaciones.trim();

    if (!motivo) {
      setErrorObservaciones(
        "Debes indicar el motivo del rechazo."
      );
      return;
    }

    const actualizado = validarMenu(
      menu.id_menu,
      "rechazado",
      motivo
    );

    if (actualizado) {
      navigate("/jefe/menus");
    }
  };

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

      {/* Alimentos del menú */}
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-health-700">
            Alimentos del menú
          </h2>

          <p className="mt-1 text-sm text-content-muted">
            Alimentos incluidos y cantidades necesarias para cada uno.
          </p>
        </div>

        {alimentos.length > 0 ? (
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {alimentos.map((contenido, index) => {       

              return (
                <div
                  key={`${contenido.id_menu}-${contenido.id_alimento}-${index}`}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium text-content">
                      {contenido.nombre_alimento}
                    </h3>

                    {grupos.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {grupos.map((grupo) => (
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
                {menu.fecha_validacion || "Pendiente de validación"}
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

      {/* Acciones exclusivas del jefe de nutrición */}
      {esJefe && esPendiente && (
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-health-700">
              Revisar menú
            </h2>

            <p className="mt-1 text-sm text-content-muted">
              Decide si el menú cumple los requisitos nutricionales.
            </p>
          </div>

          {!mostrarObservaciones ? (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="health"
                onClick={aprobarMenu}
              >
                Aprobar menú
              </Button>

              <Button
                variant="outline"
                onClick={() => setMostrarObservaciones(true)}
              >
                Rechazar menú
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="observaciones-rechazo"
                  className="mb-2 block text-sm font-medium text-content"
                >
                  Motivo del rechazo
                </label>

                <textarea
                  id="observaciones-rechazo"
                  value={observaciones}
                  onChange={(e) => {
                    setObservaciones(e.target.value);
                    setErrorObservaciones("");
                  }}
                  rows={4}
                  required
                  placeholder="Explica qué debe corregir el nutricionista..."
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-content outline-none focus:ring-2 focus:ring-health"
                />

                {errorObservaciones && (
                  <p className="mt-1 text-sm text-red-600">
                    {errorObservaciones}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarObservaciones(false);
                    setObservaciones("");
                    setErrorObservaciones("");
                  }}
                >
                  Cancelar
                </Button>

                <Button onClick={rechazarMenu}>
                  Confirmar rechazo
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

    </section>
  );
};
