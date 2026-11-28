// src/pages/Patient/SolicitarRevalorizacion.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  obtenerNutricionistas,
  crearSolicitud,
} from "../../services/menuService";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export const SolicitarRevalorizacion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [idNutricionista, setIdNutricionista] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  // Si no hay usuario, mostramos un aviso.
  if (!user) {
    return (
      <Card>
        <p className="text-sm text-content-muted">
          No se encontró el usuario.
        </p>
        <Button onClick={() => navigate("/paciente")} className="mt-4">
          Volver al panel
        </Button>
      </Card>
    );
  }

  // Obtenemos los nutricionistas disponibles.
  const nutricionistas = obtenerNutricionistas();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validamos que se haya seleccionado un nutricionista.
    if (!idNutricionista) {
      setError("Debes seleccionar un nutricionista.");
      return;
    }

    // Validamos que la descripción no esté vacía.
    if (!descripcion.trim()) {
      setError("Debes escribir el motivo de la solicitud.");
      return;
    }

    // Creamos la solicitud.
    const { solicitud, error: errorCrear } = crearSolicitud(
      user.id_usuario,
      Number(idNutricionista),
      descripcion.trim()
    );

    if (errorCrear) {
      setError(errorCrear);
      return;
    }

    // Mostramos mensaje de éxito y redirigimos.
    setMensaje("Solicitud enviada correctamente.");
    setTimeout(() => navigate("/paciente"), 1500);
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-content">
          Solicitar revalorización
        </h1>
        <p className="mt-1 text-sm text-content-muted">
          Selecciona un nutricionista y explica el motivo de tu solicitud.
        </p>
      </header>

      <Card className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de nutricionista */}
          <div>
            <label className="block text-sm font-medium text-content">
              Nutricionista
            </label>
            <select
              value={idNutricionista}
              onChange={(e) => setIdNutricionista(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Selecciona un nutricionista</option>
              {nutricionistas.map((nutri) => (
                <option key={nutri.id_usuario} value={nutri.id_usuario}>
                  {nutri.nombre} {nutri.apellidos} — {nutri.especialidad}
                </option>
              ))}
            </select>
          </div>

          {/* Motivo de la solicitud */}
          <div>
            <label className="block text-sm font-medium text-content">
              Motivo de la solicitud
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Explica por qué solicitas una revalorización..."
            />
          </div>

          {/* Mensajes de error o éxito */}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {mensaje && <p className="text-sm text-green-600">{mensaje}</p>}

          {/* Botones */}
          <div className="flex gap-3">
            <Button type="submit" variant="health">
              Enviar solicitud
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/paciente")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
};