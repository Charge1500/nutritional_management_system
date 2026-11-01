
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";



import {
  obtenerGrupoPorId,
  obtenerAlimentosDeGrupo,
} from "../../../services/foodService";

import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";


export const GroupForm = () => {

  
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

const idGrupo = searchParams.get("id");
const modoEdicion = idGrupo !== null;

const grupoEditar = modoEdicion
  ? obtenerGrupoPorId(Number(idGrupo))
  : null;

const [formData, setFormData] = useState(() => ({
  nombre_grupo: grupoEditar?.nombre_grupo ?? "",
  descripcion: grupoEditar?.descripcion ?? "",
}));



  // Actualizar los valores del formulario.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((datosAnteriores) => ({
      ...datosAnteriores,
      [name]: value,
    }));
  };

  // Comprobar si el grupo puede modificarse.
  const alimentosAsociados = modoEdicion && grupoEditar
    ? obtenerAlimentosDeGrupo(id)
    : [];

  const puedeEditar = alimentosAsociados.length === 0;

  // Evitar acceder a un grupo inexistente.
  if (modoEdicion && !grupoEditar) {
    return (
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-bold text-content">
          Grupo no encontrado
        </h2>

        <p className="text-sm text-content-muted">
          El grupo que intentas editar no existe.
        </p>

        <Button
          type="button"
          onClick={() => navigate("/jefe/grupos")}
        >
          Volver a los grupos
        </Button>
      </Card>
    );
  }

  // Aplicar la restricción RF-06 también al acceder directamente a la URL.
  if (modoEdicion && !puedeEditar) {
    return (
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-bold text-content">
          No se puede editar este grupo
        </h2>

        <p className="text-sm text-content-muted">
          Este grupo tiene {alimentosAsociados.length} alimentos asociados.
          Según las reglas del sistema, no se puede modificar mientras
          tenga alimentos relacionados.
        </p>

        <Button
          type="button"
          onClick={() => navigate(`/jefe/grupos/${id}`)}
        >
          Volver a los detalles
        </Button>
      </Card>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    // En el siguiente paso conectaremos el formulario
    // con las funciones para crear y actualizar grupos.
  };

  return (
    <Card className="space-y-8 p-5 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Encabezado */}
        <header className="border-b border-gray-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-health-50 text-health-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v18m9-9H3"
                />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-content sm:text-2xl">
                {modoEdicion
                  ? "Editar grupo nutricional"
                  : "Nuevo grupo nutricional"}
              </h2>

              <p className="mt-1 text-sm leading-6 text-content-muted">
                {modoEdicion
                  ? "Actualiza la información del grupo nutricional."
                  : "Registra un nuevo grupo nutricional en el sistema."}
              </p>
            </div>
          </div>
        </header>

        {/* Información general */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-health-50 text-sm font-bold text-health-700">
              1
            </span>

            <div>
              <h3 className="font-semibold text-content">
                Información general
              </h3>

              <p className="text-sm text-content-muted">
                Datos básicos para identificar el grupo.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <Input
              label="Nombre del grupo"
              name="nombre_grupo"
              value={formData.nombre_grupo}
              onChange={handleChange}
              placeholder="Ej. Cereales"
              required
            />

            <div className="space-y-2">
              <label
                htmlFor="descripcion"
                className="block text-sm font-medium text-content"
              >
                Descripción
                <span className="ml-1 font-normal text-content-muted">
                  (opcional)
                </span>
              </label>

              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                placeholder="Describe los alimentos que pertenecen a este grupo..."
                className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-content outline-none transition placeholder:text-gray-400 focus:border-health-500 focus:ring-4 focus:ring-health-100"
              />
            </div>
          </div>
        </section>

        {/* Acciones */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-content-muted">
            El nombre del grupo es obligatorio.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/jefe/grupos")}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="health"
              disabled={!formData.nombre_grupo.trim()}
            >
              {modoEdicion ? "Guardar cambios" : "Crear grupo"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
