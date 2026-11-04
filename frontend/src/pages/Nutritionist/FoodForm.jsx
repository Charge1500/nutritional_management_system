import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
 
  obtenerAlimentos,
  obtenerAlimentoPorId,
 
} from "../../services/foodService";

import{
  obtenerGruposNutricionales,
   obtenerGruposDeAlimento,
} from "../../services/nutritionalGroupService"

import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

export const FoodForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Detectar si estamos creando o editando un alimento.
  const idAlimento = searchParams.get("id");
  const modoEdicion = idAlimento !== null;

  const alimentoEditar = modoEdicion
    ? obtenerAlimentoPorId(Number(idAlimento))
    : null;

  const gruposNutricionales = obtenerGruposNutricionales();
  const alimentosDisponibles = obtenerAlimentos();

  // Inicializar los datos generales del formulario.
  const [formData, setFormData] = useState(() => ({
    nombre_alimento: alimentoEditar?.nombre_alimento ?? "",
    tipo_preparacion: alimentoEditar?.tipo_preparacion ?? "",
    nivel_calorico: alimentoEditar?.nivel_calorico ?? "",
    tipo_plato: alimentoEditar?.tipo_plato ?? "simple",
    detalles_alimento: alimentoEditar?.detalles_alimento ?? "",
  }));

  // Inicializar los grupos seleccionados desde el servicio.
  // Los identificadores correctos son id_grupo_nutricional.
  const [gruposSeleccionados, setGruposSeleccionados] = useState(() => {
    if (!modoEdicion || !alimentoEditar) {
      return [];
    }

    return obtenerGruposDeAlimento(Number(idAlimento)).map(
      (grupo) => grupo.id_grupo_nutricional
    );
  });

  // Ingredientes de un alimento compuesto.
  const [ingredientes, setIngredientes] = useState([]);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState("");
  const [cantidadIngrediente, setCantidadIngrediente] = useState("");
  const [unidadIngrediente, setUnidadIngrediente] = useState("g");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Seleccionar o deseleccionar un grupo nutricional.
  const manejarGrupo = (idGrupo) => {
    const id = Number(idGrupo);

    setGruposSeleccionados((prev) =>
      prev.includes(id)
        ? prev.filter((idSeleccionado) => idSeleccionado !== id)
        : [...prev, id]
    );
  };

  // Para los alimentos compuestos, mostrar solo alimentos simples
  // como ingredientes, evitando que un compuesto se incluya a sí mismo.
  const alimentosSimples = alimentosDisponibles.filter(
    (alimento) =>
      alimento.tipo_plato === "simple" &&
      alimento.id_alimento !== Number(idAlimento)
  );

  const agregarIngrediente = () => {
    if (!ingredienteSeleccionado || cantidadIngrediente === "") {
      return;
    }

    const cantidad = Number(cantidadIngrediente);

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      return;
    }

    const idIngrediente = Number(ingredienteSeleccionado);

    if (
      ingredientes.some(
        (ingrediente) => ingrediente.id_alimento === idIngrediente
      )
    ) {
      return;
    }

    setIngredientes((prev) => [
      ...prev,
      {
        id_alimento: idIngrediente,
        cantidad,
        unidad_medida: unidadIngrediente,
      },
    ]);

    setIngredienteSeleccionado("");
    setCantidadIngrediente("");
    setUnidadIngrediente("g");
  };

  const eliminarIngrediente = (idIngrediente) => {
    setIngredientes((prev) =>
      prev.filter(
        (ingrediente) => ingrediente.id_alimento !== idIngrediente
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Todavía falta conectar aquí las funciones de creación y actualización
    // del servicio para guardar los cambios en los datos.
    console.log({
      ...formData,
      gruposSeleccionados,
      ingredientes,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-content">
          {modoEdicion ? "Editar alimento" : "Crear alimento"}
        </h1>

        <p className="mt-1 text-sm text-content/70">
          {modoEdicion
            ? "Modifica la información del alimento."
            : "Completa la información para registrar un alimento."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información general */}
        <Card>
          <div className="space-y-5 p-5">
            <h2 className="text-lg font-semibold text-content">
              Información general
            </h2>

            <Input
              id="nombre_alimento"
              name="nombre_alimento"
              label="Nombre del alimento"
              value={formData.nombre_alimento}
              onChange={handleChange}
              placeholder="Ej. Arroz blanco"
              required
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                id="tipo_preparacion"
                name="tipo_preparacion"
                label="Tipo de preparación"
                value={formData.tipo_preparacion}
                onChange={handleChange}
                options={[
                  { value: "crudo", label: "Crudo" },
                  { value: "hervido", label: "Hervido" },
                  { value: "asado", label: "Asado" },
                  { value: "frito", label: "Frito" },
                  { value: "horneado", label: "Horneado" },
                  { value: "vapor", label: "Al vapor" },
                  { value: "otro", label: "Otro" },
                ]}
                required
              />

              <Select
                id="nivel_calorico"
                name="nivel_calorico"
                label="Nivel calórico"
                value={formData.nivel_calorico}
                onChange={handleChange}
                options={[
                  { value: "bajo", label: "Bajo" },
                  { value: "medio", label: "Medio" },
                  { value: "alto", label: "Alto" },
                ]}
                required
              />
            </div>

            <Select
              id="tipo_plato"
              name="tipo_plato"
              label="Tipo de alimento"
              value={formData.tipo_plato}
              onChange={handleChange}
              options={[
                { value: "simple", label: "Simple" },
                { value: "compuesto", label: "Compuesto" },
              ]}
              required
            />

            <div>
              <label
                htmlFor="detalles_alimento"
                className="mb-2 block text-sm font-medium text-content"
              >
                Detalles del alimento
              </label>

              <textarea
                id="detalles_alimento"
                name="detalles_alimento"
                value={formData.detalles_alimento}
                onChange={handleChange}
                placeholder="Descripción u observaciones del alimento..."
                rows={3}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-content outline-none focus:ring-2 focus:ring-food"
              />
            </div>
          </div>
        </Card>

        {/* Grupos nutricionales */}
        <Card>
          <div className="space-y-4 p-5">
            <div>
              <h2 className="text-lg font-semibold text-content">
                Grupos nutricionales
              </h2>

              <p className="mt-1 text-sm text-content/70">
                Selecciona los grupos a los que pertenece este alimento.
              </p>
            </div>

            {gruposNutricionales.length === 0 ? (
              <p className="text-sm text-content/70">
                No hay grupos nutricionales disponibles.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {gruposNutricionales.map((grupo) => {
                  const idGrupo = Number(grupo.id_grupo_nutricional);
                  const seleccionado = gruposSeleccionados.includes(idGrupo);

                  return (
                    <label
                      key={idGrupo}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                        seleccionado
                          ? "border-food bg-food/10"
                          : "border-border hover:bg-surface"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() => manejarGrupo(idGrupo)}
                        className="mt-1 accent-orange-600"
                      />

                      <span className="text-sm font-medium text-content">
                        {grupo.nombre_grupo}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <p className="text-sm text-content/70">
              Grupos seleccionados: {gruposSeleccionados.length}
            </p>
          </div>
        </Card>

        {/* Ingredientes de un alimento compuesto */}
        {formData.tipo_plato === "compuesto" && (
          <Card>
            <div className="space-y-5 p-5">
              <div>
                <h2 className="text-lg font-semibold text-content">
                  Ingredientes
                </h2>

                <p className="mt-1 text-sm text-content/70">
                  Añade los alimentos simples que forman parte de esta
                  preparación.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  id="ingrediente"
                  label="Alimento"
                  value={ingredienteSeleccionado}
                  onChange={(e) => setIngredienteSeleccionado(e.target.value)}
                  options={alimentosSimples.map((alimento) => ({
                    value: String(alimento.id_alimento),
                    label: alimento.nombre_alimento,
                  }))}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id="cantidad_ingrediente"
                    label="Cantidad"
                    type="number"
                    min="0"
                    step="any"
                    value={cantidadIngrediente}
                    onChange={(e) => setCantidadIngrediente(e.target.value)}
                    placeholder="Ej. 100"
                  />

                  <Select
                    id="unidad_ingrediente"
                    label="Unidad"
                    value={unidadIngrediente}
                    onChange={(e) => setUnidadIngrediente(e.target.value)}
                    options={[
                      { value: "g", label: "g" },
                      { value: "ml", label: "ml" },
                      { value: "unidades", label: "Unidades" },
                      { value: "porciones", label: "Porciones" },
                    ]}
                  />
                </div>
              </div>

              <Button type="button" onClick={agregarIngrediente}>
                Agregar ingrediente
              </Button>

              {ingredientes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-content">
                    Ingredientes añadidos
                  </h3>

                  {ingredientes.map((ingrediente) => {
                    const alimento = alimentosDisponibles.find(
                      (item) =>
                        item.id_alimento === ingrediente.id_alimento
                    );

                    return (
                      <div
                        key={ingrediente.id_alimento}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                      >
                        <div>
                          <p className="font-medium text-content">
                            {alimento?.nombre_alimento ??
                              "Alimento no encontrado"}
                          </p>

                          <p className="text-sm text-content/70">
                            {ingrediente.cantidad}{" "}
                            {ingrediente.unidad_medida}
                          </p>
                        </div>

                        <Button
                          type="button"
                          onClick={() =>
                            eliminarIngrediente(ingrediente.id_alimento)
                          }
                        >
                          Eliminar
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Acciones */}
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" onClick={() => navigate(-1)}>
            Cancelar
          </Button>

          <Button type="submit">
            {modoEdicion ? "Guardar cambios" : "Crear alimento"}
          </Button>
        </div>
      </form>
    </div>
  );
};