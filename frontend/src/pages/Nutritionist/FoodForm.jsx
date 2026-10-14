import { useState, useEffect } from "react";

import {
    obtenerGruposNutricionales,
    obtenerAlimentos,
    obtenerAlimentoPorId,
    obtenerGruposDeAlimento,
} from "../../services/foodService";

import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { useSearchParams } from "react-router-dom";

import { Card } from "../../components/Card";

export const FoodForm = () => {
    const [searchParams] = useSearchParams();

    const idAlimento = searchParams.get("id");

    const modoEdicion = idAlimento !== null;

    const alimentoEditar = modoEdicion
        ? obtenerAlimentoPorId(Number(idAlimento))
        : null;

    const [formData, setFormData] = useState({
        nombre_alimento: "",
        tipo_preparacion: "",
        nivel_calorico: "",
        tipo_plato: "",
        detalles_alimento: "",
    });

    const [gruposSeleccionados, setGruposSeleccionados] = useState([]);
    useEffect(() => {
        if (!modoEdicion || !alimentoEditar) {

            return;
        }

        setFormData({
            nombre_alimento: alimentoEditar.nombre_alimento ?? "",
            tipo_preparacion: alimentoEditar.tipo_preparacion ?? "",
            nivel_calorico: alimentoEditar.nivel_calorico ?? "",
            tipo_plato: alimentoEditar.tipo_plato ?? "",
            observaciones: alimentoEditar.observaciones ?? "",

        });


        const gruposDelAlimento = obtenerGruposDeAlimento(idAlimento);

        setGruposSeleccionados(
            gruposDelAlimento.map((grupo) => grupo.id_grupo_nutricional),
        );
    }, [modoEdicion, idAlimento]);

    const gruposNutricionales = obtenerGruposNutricionales();
    const alimentosDisponibles = obtenerAlimentos();

    // Actualizar los valores de los campos del formulario.
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
                : [...seleccionados, idGrupo],
        );
    };
    if (modoEdicion && !alimentoEditar) {
        return (
            <Card className="space-y-4 p-6">
                <h2 className="text-lg font-bold text-content">
                    Alimento no encontrado
                </h2>

                <p className="text-sm text-content-muted">
                    El alimento que intentas editar no existe o ya no está disponible.
                </p>
            </Card>
        );
    }

    return (
        <Card className="space-y-8 p-5 sm:p-8">
            <form className="space-y-8">
                {/* Encabezado del formulario */}
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
                                {modoEdicion ? "Editar alimento" : "Información del alimento"}
                            </h2>

                            <p className="mt-1 text-sm leading-6 text-content-muted">
                                {modoEdicion
                                    ? "Actualiza la información y la composición nutricional del alimento."
                                    : "Registra los datos, la composición y los grupos nutricionales del alimento."}
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
                                Datos básicos para identificar el alimento.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* Nombre del alimento */}
                        <div className="md:col-span-2">
                            <Input
                                label="Nombre del alimento"
                                name="nombre_alimento"
                                value={formData.nombre_alimento}
                                onChange={handleChange}
                                placeholder="Ej. Arroz con vegetales"
                                required
                            />
                        </div>

                        {/* Tipo de preparación */}
                        <Select
                            label="Tipo de preparación"
                            name="tipo_preparacion"
                            value={formData.tipo_preparacion}
                            onChange={handleChange}
                            options={[
                                { value: "entrante", label: "Entrante" },
                                { value: "plato_fuerte", label: "Plato fuerte" },
                                { value: "postre", label: "Postre" },
                                { value: "bebida", label: "Bebida" },
                            ]}
                            placeholder="Selecciona una opción"
                            required
                        />

                        {/* Nivel calórico */}
                        <Select
                            label="Nivel calórico"
                            name="nivel_calorico"
                            value={formData.nivel_calorico}
                            onChange={handleChange}
                            options={[
                                { value: "bajo", label: "Bajo" },
                                { value: "medio", label: "Medio" },
                                { value: "alto", label: "Alto" },
                            ]}
                            placeholder="Selecciona una opción"
                            required
                        />

                        {/* Tipo de plato */}
                        <div className="md:col-span-2">
                            <Select
                                label="Tipo de plato"
                                name="tipo_plato"
                                value={formData.tipo_plato}
                                onChange={handleChange}
                                options={[
                                    { value: "simple", label: "Plato simple" },
                                    { value: "compuesto", label: "Plato compuesto" },
                                ]}
                                placeholder="Selecciona una opción"
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Ingredientes del plato compuesto */}
                {formData.tipo_plato === "compuesto" && (
                    <section className="space-y-5 rounded-2xl border border-health-100 bg-health-50/40 p-4 sm:p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-health-700 shadow-sm">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 7h16M4 12h16M4 17h10"
                                    />
                                </svg>
                            </div>

                            <div>
                                <h3 className="font-semibold text-content">
                                    Composición del plato
                                </h3>
                                <p className="mt-1 text-sm leading-5 text-content-muted">
                                    Selecciona los alimentos que forman parte de esta
                                    preparación y especifica sus cantidades.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {/* Seleccionar ingrediente */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="ingrediente"
                                    className="block text-sm font-medium text-content"
                                >
                                    Alimento
                                </label>

                                <select
                                    id="ingrediente"
                                    defaultValue=""
                                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-content outline-none transition focus:border-health-500 focus:ring-4 focus:ring-health-100"
                                >
                                    <option value="" disabled>
                                        Selecciona un alimento
                                    </option>

                                    {alimentosDisponibles.map((alimento) => (
                                        <option
                                            key={alimento.id_alimento}
                                            value={alimento.id_alimento}
                                        >
                                            {alimento.nombre_alimento}
                                        </option>
                                    ))}
                                </select>

                                {alimentosDisponibles.length === 0 && (
                                    <p className="text-xs text-content-muted">
                                        No hay alimentos registrados para seleccionar.
                                    </p>
                                )}
                            </div>

                            {/* Cantidad y unidad de medida */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="cantidad_ingrediente"
                                    className="block text-sm font-medium text-content"
                                >
                                    Cantidad
                                </label>

                                <div className="flex gap-2">
                                    <input
                                        id="cantidad_ingrediente"
                                        type="number"
                                        min="0.01"
                                        step="any"
                                        placeholder="Ej. 100"
                                        className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-content outline-none transition focus:border-health-500 focus:ring-4 focus:ring-health-100"
                                    />

                                    <select
                                        aria-label="Unidad de medida"
                                        defaultValue="g"
                                        className="w-28 rounded-xl border border-gray-200 bg-white px-2 py-3 text-sm text-content outline-none transition focus:border-health-500 focus:ring-4 focus:ring-health-100"
                                    >
                                        <option value="g">Gramos (g)</option>
                                        <option value="kg">Kilogramos (kg)</option>
                                        <option value="ml">Mililitros (ml)</option>
                                        <option value="l">Litros (l)</option>
                                        <option value="unidad">Unidad</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-health-100 pt-4">
                            <Button type="button" variant="outline">
                                <span className="mr-2 text-lg">+</span>
                                Añadir ingrediente
                            </Button>
                        </div>
                    </section>
                )}

                {/* Grupos nutricionales */}
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
                                Selecciona todos los grupos a los que pertenece este alimento.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {gruposNutricionales.map((grupo) => {
                            const seleccionado = gruposSeleccionados.includes(
                                grupo.id_grupo_nutricional,
                            );

                            return (
                                <label
                                    key={grupo.id_grupo_nutricional}
                                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition duration-200 ${seleccionado
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
                            : `${gruposSeleccionados.length} ${gruposSeleccionados.length === 1 ? "grupo seleccionado" : "grupos seleccionados"
                            }`}
                    </p>
                </section>

                {/* Detalles adicionales */}
                <section className="space-y-5">
                    <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-health-50 text-sm font-bold text-health-700">
                            3
                        </span>

                        <div>
                            <h3 className="font-semibold text-content">
                                Detalles adicionales
                            </h3>
                            <p className="text-sm text-content-muted">
                                Incluye observaciones o recomendaciones relevantes.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="detalles_alimento"
                            className="block text-sm font-medium text-content"
                        >
                            Descripción
                            <span className="ml-1 font-normal text-content-muted">
                                (opcional)
                            </span>
                        </label>

                        <textarea
                            id="detalles_alimento"
                            name="detalles_alimento"
                            value={formData.detalles_alimento}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Describe las características del alimento, su preparación o recomendaciones..."
                            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-content outline-none transition placeholder:text-gray-400 focus:border-health-500 focus:ring-4 focus:ring-health-100"
                        />
                    </div>
                </section>

                {/* Acciones del formulario */}
                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-content-muted">
                        Los campos marcados son obligatorios.
                    </p>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row">
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>

                        <Button type="submit" variant="health">
                            Guardar alimento
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
};