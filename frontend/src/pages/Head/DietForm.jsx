
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  obtenerDietaPorId,
  obtenerGruposDeDieta,
  obtenerRestriccionesDeDieta,
  obtenerMenusDeDieta,
} from "../../services/dietService";

import {
  obtenerGruposNutricionales,
  obtenerAlimentos,
} from "../../services/foodService";

import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

export const DietForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Identificar si estamos creando o editando.
  const idDieta = searchParams.get("id");
  const modoEdicion = idDieta !== null;

  // Obtener la dieta que se desea editar.
  const dietaEditar = modoEdicion
    ? obtenerDietaPorId(Number(idDieta))
    : null;

  // Comprobar si la dieta tiene menús asociados.
  const menusAsociados = modoEdicion && dietaEditar
    ? obtenerMenusDeDieta(Number(idDieta))
    : [];

  const puedeEditar = menusAsociados.length === 0;

  // Obtener los datos disponibles.
  const gruposNutricionales = obtenerGruposNutricionales();
  const alimentosDisponibles = obtenerAlimentos();

  // Información general de la dieta.
  const [formData, setFormData] = useState(() => ({
    nombre_dieta: dietaEditar?.nombre_dieta ?? "",
    programa: dietaEditar?.programa ?? "",
    calorias_minimas: dietaEditar?.calorias_minimas ?? "",
    calorias_maximas: dietaEditar?.calorias_maximas ?? "",
    estado_dieta: dietaEditar?.estado_dieta ?? "borrador",
  }));

  // Grupos nutricionales asociados a la dieta.
  const [gruposSeleccionados, setGruposSeleccionados] = useState(() =>
    modoEdicion && dietaEditar
      ? obtenerGruposDeDieta(Number(idDieta)).map(
          (grupo) => grupo.id_grupo_nutricional
        )
      : []
  );

  // Restricciones alimentarias asociadas a la dieta.
  const [restricciones, setRestricciones] = useState(() =>
    modoEdicion && dietaEditar
      ? obtenerRestriccionesDeDieta(Number(idDieta)).map(
          (restriccion) => ({
            id_alimento: restriccion.id_alimento,
            cantidad_minima: restriccion.cantidad_minima,
            cantidad_maxima: restriccion.cantidad_maxima,
            unidad_medida: restriccion.unidad_medida,
          })
        )
      : []
  );

  // Datos temporales para añadir una nueva restricción.
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState("");
  const [cantidadMinima, setCantidadMinima] = useState("");
  const [cantidadMaxima, setCantidadMaxima] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("g");

  // Actualizar los campos de información general.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((datosAnteriores) => ({
      ...datosAnteriores,
      [name]: value,
    }));
  };

  // Seleccionar o deseleccionar un grupo nutricional.
  const manejarGrupo = (idGrupo) => {
    setGruposSeleccionados((seleccionados) =>
      seleccionados.includes(idGrupo)
        ? seleccionados.filter((id) => id !== idGrupo)
        : [...seleccionados, idGrupo]
    );
  };

  // Añadir una restricción alimentaria.
  const agregarRestriccion = () => {
    if (
      !alimentoSeleccionado ||
      cantidadMinima === "" ||
      cantidadMaxima === "" ||
      Number(cantidadMinima) < 0 ||
      Number(cantidadMaxima) < Number(cantidadMinima)
    ) {
      return;
    }

    const idAlimento = Number(alimentoSeleccionado);

    // Evitar asociar dos veces el mismo alimento.
    if (
      restricciones.some(
        (restriccion) => restriccion.id_alimento === idAlimento
      )
    ) {
      return;
    }

    setRestricciones((anteriores) => [
      ...anteriores,
      {
        id_alimento: idAlimento,
        cantidad_minima: Number(cantidadMinima),
        cantidad_maxima: Number(cantidadMaxima),
        unidad_medida: unidadMedida,
      },
    ]);

    // Limpiar los campos después de añadir el alimento.
    setAlimentoSeleccionado("");
    setCantidadMinima("");
    setCantidadMaxima("");
    setUnidadMedida("g");
  };

  // Eliminar un alimento de la dieta.
  const eliminarRestriccion = (idAlimento) => {
    setRestricciones((anteriores) =>
      anteriores.filter(
        (restriccion) => restriccion.id_alimento !== idAlimento
      )
    );
  };

  // Enviar el formulario.
  const handleSubmit = (e) => {
    e.preventDefault();

    // Aquí conectaremos posteriormente crearDieta y actualizarDieta.
  };

  // Comprobar si la dieta existe.
  if (modoEdicion && !dietaEditar) {
    return (
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-bold text-content">
          Dieta no encontrada
        </h2>

        <p className="text-sm text-content-muted">
          La dieta que intentas editar no existe o ya no está disponible.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/jefe/dietas")}
        >
          Volver
        </Button>
      </Card>
    );
  }

  // Impedir la edición de dietas que tienen menús asociados.
  if (modoEdicion && !puedeEditar) {
    return (
      <Card className="space-y-4 p-6">
        <h2 className="text-lg font-bold text-content">
          No es posible modificar esta dieta
        </h2>

        <p className="text-sm text-content-muted">
          Esta dieta tiene menús asociados. No se pueden modificar
          sus características mientras existan estos menús.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            navigate(`/nutricionista/dietas/${idDieta}`)
          }
        >
          Volver a los detalles
        </Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-8 p-5 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Encabezado del formulario */}
        <header className="border-b border-gray-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-health-50 text-health-700">
              <span className="text-2xl font-bold">+</span>
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-content sm:text-2xl">
                {modoEdicion ? "Editar dieta" : "Nueva dieta"}
              </h2>

              <p className="mt-1 text-sm leading-6 text-content-muted">
                {modoEdicion
                  ? "Actualiza la información y las restricciones de la dieta."
                  : "Define las características, los grupos y las restricciones de la dieta."}
              </p>
            </div>
          </div>
        </header>

        {/* 1. Información general */}
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
                Datos básicos y características nutricionales de la dieta.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Nombre */}
            <div className="md:col-span-2">
              <Input
                label="Nombre de la dieta"
                name="nombre_dieta"
                value={formData.nombre_dieta}
                onChange={handleChange}
                placeholder="Ej. Dieta equilibrada"
                required
              />
            </div>

            {/* Programa */}
            <Input
              label="Programa de atención"
              name="programa"
              value={formData.programa}
              onChange={handleChange}
              placeholder="Ej. Control de peso"
              required
            />

            {/* Estado */}
            <Select
              label="Estado de la dieta"
              name="estado_dieta"
              value={formData.estado_dieta}
              onChange={handleChange}
              options={[
                { value: "borrador", label: "Borrador" },
                { value: "guardado", label: "Guardado" },
              ]}
              required
            />

            {/* Calorías mínimas */}
            <Input
              label="Calorías mínimas (kcal)"
              name="calorias_minimas"
              type="number"
              min="0"
              value={formData.calorias_minimas}
              onChange={handleChange}
              placeholder="Ej. 1800"
              required
            />

            {/* Calorías máximas */}
            <Input
              label="Calorías máximas (kcal)"
              name="calorias_maximas"
              type="number"
              min="0"
              value={formData.calorias_maximas}
              onChange={handleChange}
              placeholder="Ej. 2000"
              required
            />
          </div>
        </section>

        {/* 2. Grupos nutricionales */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-health-50 text-sm font-bold text-health-700">
              2
            </span>

            <div>
              <h3 className="font-semibold text-content">
                Grupos nutricionales
              </h3>

              <p className="text-sm text-content-muted">
                Selecciona los grupos que debe cubrir esta dieta.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gruposNutricionales.map((grupo) => {
              const seleccionado = gruposSeleccionados.includes(
                grupo.id_grupo_nutricional
              );

              return (
                <label
                  key={grupo.id_grupo_nutricional}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition duration-200 ${
                    seleccionado
                      ? "border-health-500 bg-health-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-health-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={seleccionado}
                    onChange={() =>
                      manejarGrupo(grupo.id_grupo_nutricional)
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-health-600"
                  />

                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-content">
                      {grupo.nombre_grupo}
                    </span>

                    {grupo.descripcion && (
                      <p className="mt-1 text-xs leading-5 text-content-muted">
                        {grupo.descripcion}
                      </p>
                    )}
                  </div>

                  {seleccionado && (
                    <span className="ml-auto text-sm font-bold text-health-700">
                      ✓
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          <p className="text-xs text-content-muted">
            {gruposSeleccionados.length === 0
              ? "Todavía no has seleccionado ningún grupo."
              : `${gruposSeleccionados.length} ${
                  gruposSeleccionados.length === 1
                    ? "grupo seleccionado"
                    : "grupos seleccionados"
                }`}
          </p>
        </section>

        {/* 3. Restricciones alimentarias */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-health-50 text-sm font-bold text-health-700">
              3
            </span>

            <div>
              <h3 className="font-semibold text-content">
                Alimentos asociados
              </h3>

              <p className="text-sm text-content-muted">
                Selecciona los alimentos y establece las cantidades
                permitidas dentro de esta dieta.
              </p>
            </div>
          </div>

          {/* Añadir alimento */}
          <div className="space-y-5 rounded-2xl border border-health-100 bg-health-50/40 p-4 sm:p-6">

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Selección del alimento */}
              <div className="md:col-span-2">
                <Select
                  label="Alimento"
                  name="alimento"
                  value={alimentoSeleccionado}
                  onChange={(e) =>
                    setAlimentoSeleccionado(e.target.value)
                  }
                  options={alimentosDisponibles
                    .filter(
                      (alimento) =>
                        !restricciones.some(
                          (restriccion) =>
                            restriccion.id_alimento ===
                            alimento.id_alimento
                        )
                    )
                    .map((alimento) => ({
                      value: alimento.id_alimento,
                      label: alimento.nombre_alimento,
                    }))}
                />

                {alimentosDisponibles.length === 0 && (
                  <p className="mt-2 text-xs text-content-muted">
                    No hay alimentos registrados para seleccionar.
                  </p>
                )}
              </div>

              {/* Cantidad mínima */}
              <Input
                label="Cantidad mínima"
                type="number"
                min="0"
                step="any"
                value={cantidadMinima}
                onChange={(e) =>
                  setCantidadMinima(e.target.value)
                }
                placeholder="Ej. 50"
              />

              {/* Cantidad máxima */}
              <Input
                label="Cantidad máxima"
                type="number"
                min="0"
                step="any"
                value={cantidadMaxima}
                onChange={(e) =>
                  setCantidadMaxima(e.target.value)
                }
                placeholder="Ej. 150"
              />

              {/* Unidad de medida */}
              <div className="md:col-span-2">
                <Select
                  label="Unidad de medida"
                  value={unidadMedida}
                  onChange={(e) =>
                    setUnidadMedida(e.target.value)
                  }
                  options={[
                    { value: "g", label: "Gramos (g)" },
                    { value: "kg", label: "Kilogramos (kg)" },
                    { value: "ml", label: "Mililitros (ml)" },
                    { value: "l", label: "Litros (l)" },
                    { value: "unidades", label: "Unidades" },
                    { value: "porciones", label: "Porciones" },
                  ]}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-health-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={agregarRestriccion}
                disabled={
                  !alimentoSeleccionado ||
                  cantidadMinima === "" ||
                  cantidadMaxima === "" ||
                  Number(cantidadMinima) < 0 ||
                  Number(cantidadMaxima) < Number(cantidadMinima)
                }
              >
                <span className="mr-2 text-lg">+</span>
                Añadir alimento
              </Button>
            </div>
          </div>

          {/* Lista de alimentos asociados */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-content">
              Alimentos incluidos ({restricciones.length})
            </h4>

            {restricciones.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
                <p className="text-sm text-content-muted">
                  Todavía no has asociado alimentos a esta dieta.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {restricciones.map((restriccion) => {
                  const alimento = alimentosDisponibles.find(
                    (item) =>
                      item.id_alimento === restriccion.id_alimento
                  );

                  return (
                    <div
                      key={restriccion.id_alimento}
                      className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-content">
                          {alimento?.nombre_alimento ??
                            "Alimento no encontrado"}
                        </p>

                        <p className="mt-1 text-sm text-content-muted">
                          {restriccion.cantidad_minima} –{" "}
                          {restriccion.cantidad_maxima}{" "}
                          {restriccion.unidad_medida}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          eliminarRestriccion(
                            restriccion.id_alimento
                          )
                        }
                        className="self-start text-sm font-medium text-red-500 hover:text-red-700 sm:self-center"
                      >
                        Eliminar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Acciones del formulario */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-content-muted">
            Los campos marcados son obligatorios.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/jefe/dietas")}
            >
              Cancelar
            </Button>

            <Button type="submit" variant="health">
              {modoEdicion ? "Guardar cambios" : "Crear dieta"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
