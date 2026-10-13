
import { useState } from "react";
import { obtenerGruposNutricionales } from "../../services/foodService"

import { Input } from "../../components/Input";
import { Select } from "../../components/Select";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

// Formulario para registrar un nuevo alimento.
export const FoodForm = () => {

    const [gruposSeleccionados, setGruposSeleccionados] = useState([]);

    const gruposNutricionales = obtenerGruposNutricionales();

    const manejarGrupo = (idGrupo) => {
        setGruposSeleccionados((actuales) =>
            actuales.includes(idGrupo)
                ? actuales.filter((id) => id !== idGrupo)
                : [...actuales, idGrupo]
        );
    };

    const [formData, setFormData] = useState({
        nombre_alimento: "",
        tipo_preparacion: "",
        nivel_calorico: "",
        tipo_plato: "",
        detalles_alimento: ""
    });

    // Actualizar el campo que cambia el usuario.
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Procesar el formulario.
    const handleSubmit = (event) => {
        event.preventDefault();

        console.log(formData);
    };

    const tiposPreparacion = [
        { value: "entrante", label: "Entrante" },
        { value: "plato fuerte", label: "Plato fuerte" },
        { value: "postre", label: "Postre" },
        { value: "bebida", label: "Bebida" },
    ];

    const nivelesCaloricos = [
        { value: "bajo", label: "Bajo" },
        { value: "medio", label: "Medio" },
        { value: "alto", label: "Alto" },
    ];

    return (
        <section className="mx-auto max-w-4xl space-y-8">
            {/* Encabezado */}
            <header className="space-y-2">
                <p className="text-sm font-medium text-health-500">
                    GESTIÓN DE ALIMENTOS
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
                    Registrar alimento
                </h1>

                <p className="text-sm text-content-muted">
                    Introduce la información básica del alimento que deseas registrar.
                </p>
            </header>

            {/* Formulario */}
            <Card className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold text-content">
                            Información general
                        </h2>

                        <p className="mt-1 text-sm text-content-muted">
                            Completa los datos principales del alimento.
                        </p>
                    </div>

                    <Input
                        id="nombre_alimento"
                        name="nombre_alimento"
                        label="Nombre del alimento"
                        placeholder="Ej. Arroz integral"
                        value={formData.nombre_alimento}
                        onChange={handleChange}
                        required
                        context="health"
                    />

                    <div className="flex flex-col space-y-1.5">
                        <label
                            htmlFor="detalles_alimento"
                            className="text-sm font-medium text-content"
                        >
                            Detalles del alimento
                        </label>

                        <textarea
                            id="detalles_alimento"
                            name="detalles_alimento"
                            value={formData.detalles_alimento}
                            onChange={handleChange}
                            placeholder="Describe las características del alimento..."
                            rows={3}
                            className="block w-full rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm text-content shadow-sm focus:outline-none focus:ring-1 focus:border-food-500 focus:ring-food-500"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Select
                            id="tipo_preparacion"
                            name="tipo_preparacion"
                            label="Tipo de preparación"
                            options={tiposPreparacion}
                            value={formData.tipo_preparacion}
                            onChange={handleChange}
                            required
                            context="health"
                        />

                        <Select
                            id="nivel_calorico"
                            name="nivel_calorico"
                            label="Nivel calórico"
                            options={nivelesCaloricos}
                            value={formData.nivel_calorico}
                            onChange={handleChange}
                            required
                            context="health"
                        />
                    </div>
                    <Select
                        label="Tipo de plato"
                        id="tipo_plato"
                        name="tipo_plato"
                        value={formData.tipo_plato}
                        onChange={handleChange}
                        options={[
                            { value: "simple", label: "Plato simple" },
                            { value: "compuesto", label: "Plato compuesto" },
                        ]}
                        context="food"
                    />
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-content">
                            Grupos nutricionales
                        </h3>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {gruposNutricionales.map((grupo) => (
                                <label
                                    key={grupo.id_grupo}
                                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-surface"
                                >
                                    <input
                                        type="checkbox"
                                        checked={gruposSeleccionados.includes(grupo.id_grupo)}
                                        onChange={() => manejarGrupo(grupo.id_grupo)}
                                        className="h-4 w-4 accent-emerald-600"
                                    />

                                    <span className="text-sm text-content">
                                        {grupo.nombre_grupo}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancelar
                        </Button>

                        <Button type="submit" variant="health">
                            Registrar alimento
                        </Button>
                    </div>
                </form>
            </Card>
        </section>
    );
};
