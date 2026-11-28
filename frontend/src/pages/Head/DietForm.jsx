
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  obtenerDatosFormularioDieta,
  obtenerDatosNuevaDieta,
} from "../../services/facades/nutritionistBossFecade";

import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

export const DietForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Identificar si estamos creando o editando una dieta.
  const idDieta = searchParams.get("id");
  const modoEdicion = idDieta !== null;

  // Obtener todos los datos necesarios a través de la fachada.
  const datosDieta = modoEdicion
    ? obtenerDatosFormularioDieta(idDieta)
    : obtenerDatosNuevaDieta();

  const dietaEditar = datosDieta?.dieta ?? null;
  const menusAsociados = datosDieta?.menusAsociados ?? [];

  const puedeEditar = menusAsociados.length === 0;

  const gruposNutricionales =
    datosDieta?.gruposDisponibles ?? [];

  const alimentosDisponibles =
    datosDieta?.alimentosDisponibles ?? [];

  // Datos principales de la dieta.
  const [formData, setFormData] = useState(() => ({
    nombre_dieta: dietaEditar?.nombre_dieta ?? "",
    programa: dietaEditar?.programa ?? "",
    calorias_minimas: dietaEditar?.calorias_minimas ?? "",
    calorias_maximas: dietaEditar?.calorias_maximas ?? "",
    estado_dieta: dietaEditar?.estado_dieta ?? "borrador",
  }));

  // Grupos nutricionales asociados a la dieta.
  const [gruposSeleccionados, setGruposSeleccionados] = useState(
    () =>
      datosDieta?.grupos?.map(
        (grupo) => grupo.id_grupo_nutricional
      ) ?? []
  );

  // Restricciones alimentarias de la dieta.
  const [restricciones, setRestricciones] = useState(
    () =>
      datosDieta?.restricciones?.map((restriccion) => ({
        id_alimento: restriccion.id_alimento,
        cantidad_minima: restriccion.cantidad_minima,
        cantidad_maxima: restriccion.cantidad_maxima,
        unidad_medida: restriccion.unidad_medida,
      })) ?? []
  );

  // Datos temporales para agregar una restricción.
  const [alimentoSeleccionado, setAlimentoSeleccionado] =
    useState("");

  const [cantidadMinima, setCantidadMinima] = useState("");
  const [cantidadMaxima, setCantidadMaxima] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("g");

  // Actualizar los campos principales del formulario.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Agregar o quitar un grupo nutricional.
  const manejarGrupo = (idGrupo) => {
    setGruposSeleccionados((prev) =>
      prev.includes(Number(idGrupo))
        ? prev.filter((id) => id !== Number(idGrupo))
        : [...prev, Number(idGrupo)]
    );
  };

  // Agregar una restricción alimentaria.
  const agregarRestriccion = () => {
    if (
      !alimentoSeleccionado ||
      cantidadMinima === "" ||
      cantidadMaxima === "" ||
      Number(cantidadMinima) > Number(cantidadMaxima)
    ) {
      return;
    }

    const nuevaRestriccion = {
      id_alimento: Number(alimentoSeleccionado),
      cantidad_minima: Number(cantidadMinima),
      cantidad_maxima: Number(cantidadMaxima),
      unidad_medida: unidadMedida,
    };

    // Evitar agregar el mismo alimento más de una vez.
    const yaExiste = restricciones.some(
      (restriccion) =>
        restriccion.id_alimento === nuevaRestriccion.id_alimento
    );

    if (yaExiste) return;

    setRestricciones((prev) => [
      ...prev,
      nuevaRestriccion,
    ]);

    setAlimentoSeleccionado("");
    setCantidadMinima("");
    setCantidadMaxima("");
    setUnidadMedida("g");
  };

  // Eliminar una restricción.
  const eliminarRestriccion = (idAlimento) => {
    setRestricciones((prev) =>
      prev.filter(
        (restriccion) =>
          restriccion.id_alimento !== Number(idAlimento)
      )
    );
  };

  // Guardar la dieta.
  const handleSubmit = (e) => {
    e.preventDefault();

    const dieta = {
      ...formData,
      calorias_minimas: Number(formData.calorias_minimas),
      calorias_maximas: Number(formData.calorias_maximas),
      grupos: gruposSeleccionados,
      restricciones,
    };

    console.log(
      modoEdicion ? "Actualizar dieta:" : "Crear dieta:",
      dieta
    );

    // Aquí se conectará posteriormente con el servicio
    // correspondiente para crear o actualizar la dieta.

    navigate("/jefe/dietas");
  };

  // Si estamos editando y la dieta no existe.
  if (modoEdicion && !dietaEditar) {
    return (
      <Card>
        <h2 className="text-xl font-semibold">
          Dieta no encontrada
        </h2>

        <p className="mt-2 text-gray-600">
          No se encontró la dieta que intentas consultar.
        </p>

        <Button onClick={() => navigate("/jefe/dietas")}>
          Volver
        </Button>
      </Card>
    );
  }

  // No permitir modificar una dieta que tiene menús asociados.
  if (modoEdicion && !puedeEditar) {
    return (
      <Card>
        <h2 className="text-xl font-semibold">
          No se puede modificar esta dieta
        </h2>

        <p className="mt-2 text-gray-600">
          Esta dieta tiene menús asociados. No es posible
          modificar sus grupos ni sus restricciones alimentarias.
        </p>

        <Button onClick={() => navigate("/jefe/dietas")}>
          Volver
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            {modoEdicion ? "Editar dieta" : "Crear dieta"}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Define las características y restricciones de la dieta.
          </p>
        </div>

        {/* Información general */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre de la dieta"
            name="nombre_dieta"
            value={formData.nombre_dieta}
            onChange={handleChange}
            required
          />

          <Input
            label="Programa"
            name="programa"
            value={formData.programa}
            onChange={handleChange}
          />

          <Input
            label="Calorías mínimas"
            name="calorias_minimas"
            type="number"
            value={formData.calorias_minimas}
            onChange={handleChange}
            required
          />

          <Input
            label="Calorías máximas"
            name="calorias_maximas"
            type="number"
            value={formData.calorias_maximas}
            onChange={handleChange}
            required
          />
        </div>

        {/* Grupos nutricionales */}
        <section>
          <h3 className="font-semibold mb-3">
            Grupos nutricionales
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gruposNutricionales.map((grupo) => {
              const seleccionado = gruposSeleccionados.includes(
                grupo.id_grupo_nutricional
              );

              return (
                <label
                  key={grupo.id_grupo_nutricional}
                  className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={seleccionado}
                    onChange={() =>
                      manejarGrupo(grupo.id_grupo_nutricional)
                    }
                  />

                  <span>{grupo.nombre_grupo}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Restricciones alimentarias */}
        <section>
          <h3 className="font-semibold mb-3">
            Restricciones alimentarias
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select
              label="Alimento"
              value={alimentoSeleccionado}
              onChange={(e) =>
                setAlimentoSeleccionado(e.target.value)
              }
              options={alimentosDisponibles.map((alimento) => ({
                value: alimento.id_alimento,
                label: alimento.nombre_alimento,
              }))}
            />

            <Input
              label="Cantidad mínima"
              type="number"
              value={cantidadMinima}
              onChange={(e) => setCantidadMinima(e.target.value)}
            />

            <Input
              label="Cantidad máxima"
              type="number"
              value={cantidadMaxima}
              onChange={(e) => setCantidadMaxima(e.target.value)}
            />

            <Select
              label="Unidad de medida"
              value={unidadMedida}
              onChange={(e) => setUnidadMedida(e.target.value)}
              options={[
                { value: "g", label: "Gramos" },
                { value: "ml", label: "Mililitros" },
                { value: "unidad", label: "Unidad" },
              ]}
            />
          </div>

          <Button
            type="button"
            onClick={agregarRestriccion}
          >
            Agregar restricción
          </Button>

          {restricciones.length > 0 && (
            <div className="mt-4 space-y-2">
              {restricciones.map((restriccion) => {
                const alimento = alimentosDisponibles.find(
                  (item) =>
                    item.id_alimento === restriccion.id_alimento
                );

                return (
                  <div
                    key={restriccion.id_alimento}
                    className="flex items-center justify-between border rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {alimento?.nombre_alimento ??
                          "Alimento no encontrado"}
                      </p>

                      <p className="text-sm text-gray-500">
                        {restriccion.cantidad_minima} -{" "}
                        {restriccion.cantidad_maxima}{" "}
                        {restriccion.unidad_medida}
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() =>
                        eliminarRestriccion(restriccion.id_alimento)
                      }
                    >
                      Eliminar
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Estado */}
        <Select
          label="Estado"
          name="estado_dieta"
          value={formData.estado_dieta}
          onChange={handleChange}
          options={[
            { value: "borrador", label: "Borrador" },
            { value: "guardado", label: "Guardado" },
          ]}
        />

        {/* Acciones */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={() => navigate("/jefe/dietas")}
          >
            Cancelar
          </Button>

          <Button type="submit">
            {modoEdicion ? "Guardar cambios" : "Crear dieta"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
