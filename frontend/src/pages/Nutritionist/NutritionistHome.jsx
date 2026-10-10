import { obtenerUsuarioPorId } from "../../services/userService";
import { obtenerDietasAutorizadas } from "../../services/dietService";
import { DietCard } from "../../components/nutritionist/DietCard";
import { Card } from "../../components/Card";

export const NutritionistHome = () => {
  // Obtenemos el usuario simulado que está utilizando la aplicación.
  const usuarioActual = obtenerUsuarioPorId(1);

  // Obtenemos las dietas autorizadas del usuario.
  // Si no encontramos al usuario, utilizamos un array vacío.
  const dietasAutorizadas = usuarioActual
    ? obtenerDietasAutorizadas(usuarioActual.id_usuario)
    : [];

  // Si no existe el usuario, mostramos un mensaje y detenemos el renderizado.
  if (!usuarioActual) {
    return (
      <div className="rounded-xl border border-gray-200 bg-surface p-6">
        <h1 className="text-lg font-semibold text-content">
          No se encontró el usuario
        </h1>

        <p className="mt-2 text-sm text-content-muted">
          No ha sido posible cargar la información del nutricionista.
        </p>
      </div>
    );
  }

  return (
    // Contenedor principal de la página.
    // Separamos las secciones para mejorar la organización visual.
    <section className="mx-auto max-w-7xl space-y-8">

      {/* Cabecera de bienvenida al nutricionista. */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* Texto secundario que identifica la sección actual. */}
          <p className="mb-2 text-sm font-medium text-health-500">
            PANEL DE NUTRICIONISTA
          </p>

          {/* Saludo personalizado con el nombre del usuario. */}
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            ¡Bienvenida, {usuarioActual.nombre}!
          </h1>

          {/* Mostramos la especialidad del nutricionista. */}
          <p className="mt-2 text-sm text-content-muted sm:text-base">
            {usuarioActual.especialidad}
          </p>
        </div>
      </header>

      {/* Resumen de las dietas autorizadas. */}
      <section aria-label="Resumen de dietas">
        <Card className="flex items-center gap-4">
          {/* Elemento visual que identifica la información resumida. */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-health-500/10">
            <span
              className="text-2xl text-health-500"
              aria-hidden="true"
            >
              ≡
            </span>
          </div>

          <div>
            {/* Total calculado a partir de las dietas obtenidas. */}
            <p className="text-2xl font-bold text-content">
              {dietasAutorizadas.length}
            </p>

            <p className="text-sm text-content-muted">
              Dietas autorizadas
            </p>
          </div>
        </Card>
      </section>

      {/* Sección principal con las tarjetas de las dietas. */}
      <section className="space-y-5">

        {/* Título y descripción de la sección. */}
        <header>
          <h2 className="text-xl font-bold text-content sm:text-2xl">
            Mis dietas autorizadas
          </h2>

          <p className="mt-1 text-sm text-content-muted">
            Consulta y revisa las dietas asociadas a tu perfil.
          </p>
        </header>

        {/* Comprobamos si hay dietas para mostrar. */}
        {dietasAutorizadas.length === 0 ? (

          // Estado vacío: mensaje informativo cuando no hay dietas.
          <Card className="py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-health-500/10">
              <span
                className="text-2xl text-health-500"
                aria-hidden="true"
              >
                ≡
              </span>
            </div>

            <h3 className="mt-4 font-semibold text-content">
              Todavía no tienes dietas autorizadas
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-content-muted">
              Cuando tengas dietas autorizadas, aparecerán aquí para que
              puedas consultar su información.
            </p>
          </Card>

        ) : (

          // Si existen dietas, generamos una tarjeta por cada una.
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {dietasAutorizadas.map((dieta) => (
              <DietCard
                key={dieta.id_dieta}
                diet={dieta}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
};