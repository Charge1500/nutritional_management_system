// src/pages/Patient/PatientHome.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  obtenerMenusAsignados,
  obtenerDietasInscritas,
  obtenerValoracionesDePaciente,
} from "../../services/menuService";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { MenuCard } from "../../components/patient/MenuCard";

export const PatientHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Si no hay usuario, mostramos un aviso (no debería pasar gracias a ProtectedRoute)
  if (!user) {
    return (
      <Card>
        <h1 className="text-lg font-semibold text-content">
          No se encontró el usuario
        </h1>
        <p className="mt-2 text-sm text-content-muted">
          No ha sido posible cargar la información del paciente.
        </p>
      </Card>
    );
  }

  // Cargamos los datos del paciente desde los servicios.
  const menus = obtenerMenusAsignados(user.id_usuario);
  const dietas = obtenerDietasInscritas(user.id_usuario);
  const valoraciones = obtenerValoracionesDePaciente(user.id_usuario);

  return (
    <section className="mx-auto max-w-7xl space-y-8">

      {/* Cabecera: bienvenida + botón de revalorización */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-health-500">
            PANEL DE PACIENTE
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            ¡Bienvenido, {user.nombre}!
          </h1>

          <p className="mt-2 text-sm text-content-muted sm:text-base">
            Sala {user.sala} · {user.edad} años
          </p>
        </div>

        <Button
          variant="health"
          onClick={() => navigate("/paciente/revaloracion")}
        >
          Solicitar revalorización
        </Button>
      </header>

      {/* Resumen numérico: menús, completados, dietas */}
      <section
        aria-label="Resumen del paciente"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <Card className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-health-500/10">
            <span className="text-2xl text-health-500" aria-hidden="true">
              ≡
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-content">{menus.length}</p>
            <p className="text-sm text-content-muted">Menús asignados</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-health-500/10">
            <span className="text-2xl text-health-500" aria-hidden="true">
              ✓
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-content">
              {menus.filter((m) => m.completado).length}
            </p>
            <p className="text-sm text-content-muted">Completados</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-health-500/10">
            <span className="text-2xl text-health-500" aria-hidden="true">
              ◉
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-content">{dietas.length}</p>
            <p className="text-sm text-content-muted">Dietas inscritas</p>
          </div>
        </Card>
      </section>

      {/* Dietas inscritas */}
      <section className="space-y-5">
        <header>
          <h2 className="text-xl font-bold text-content sm:text-2xl">
            Mis dietas inscritas
          </h2>
          <p className="mt-1 text-sm text-content-muted">
            Dietas en las que estás inscrito actualmente.
          </p>
        </header>

        {dietas.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-sm text-content-muted">
              No estás inscrito en ninguna dieta.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {dietas.map((dieta) => (
              <Card key={dieta.id_dieta} className="space-y-3">
                <h3 className="text-lg font-semibold text-content">
                  {dieta.nombre_dieta}
                </h3>

                <p className="text-sm text-content">
                  Programa: {dieta.programa}
                </p>

                <p className="text-sm text-content-muted">
                  Estado: {dieta.estado_dieta}
                </p>

                {dieta.calorias_minimas && dieta.calorias_maximas && (
                  <p className="text-sm text-content-muted">
                    Rango calórico: {dieta.calorias_minimas} -{" "}
                    {dieta.calorias_maximas} kcal
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Menús asignados */}
      <section className="space-y-5">
        <header>
          <h2 className="text-xl font-bold text-content sm:text-2xl">
            Mis menús asignados
          </h2>
          <p className="mt-1 text-sm text-content-muted">
            Consulta y registra el consumo de tus menús.
          </p>
        </header>

        {menus.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-sm text-content-muted">
              Todavía no tienes menús asignados.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {menus.map((asignacion) => (
              <MenuCard
                key={asignacion.id_menu_asignado}
                asignacion={asignacion}
              />
            ))}
          </div>
        )}
      </section>

      {/* Valoraciones recibidas */}
      <section className="space-y-5">
        <header>
          <h2 className="text-xl font-bold text-content sm:text-2xl">
            Mis valoraciones
          </h2>
          <p className="mt-1 text-sm text-content-muted">
            Historial de valoraciones nutricionales recibidas.
          </p>
        </header>

        {valoraciones.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-sm text-content-muted">
              Aún no tienes valoraciones registradas.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-content-muted">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Dieta</th>
                  <th className="px-4 py-3">Nutricionista</th>
                  <th className="px-4 py-3">Puntuación</th>
                  <th className="px-4 py-3">Tipo</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {valoraciones.map((valoracion) => (
                  <tr key={valoracion.id_valoracion}>
                    <td className="px-4 py-3 text-content">
                      {valoracion.fecha_valoracion}
                    </td>

                    <td className="px-4 py-3 text-content-muted">
                      {valoracion.dieta?.nombre_dieta || "—"}
                    </td>

                    <td className="px-4 py-3 text-content-muted">
                      {valoracion.nutricionista?.nombre || "—"}
                    </td>

                    <td className="px-4 py-3 font-medium text-content">
                      {valoracion.puntuacion}/100
                    </td>

                    <td className="px-4 py-3 text-content-muted capitalize">
                      {valoracion.tipo_val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </section>
  );
};