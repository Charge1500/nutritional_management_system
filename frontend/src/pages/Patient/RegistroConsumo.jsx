// src/pages/Patient/RegistroConsumo.jsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  obtenerMenusAsignados,
  obtenerAlimentosDeMenu,
  registrarConsumo,
} from "../../services/menuService";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

export const RegistroConsumo = () => {

  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idAsignacion = searchParams.get("idAsignacion");

  const [estadoConsumo, setEstadoConsumo] = useState("consumido");
  const [observaciones, setObservaciones] = useState("");
  const [mensaje, setMensaje] = useState(null);

  

  // Si no hay usuario o no hay id_asignacion, mostramos aviso.
  if (!user || !idAsignacion) {
    return (
      <Card>
        <p className="text-sm text-content-muted">
          No se encontró la asignación a registrar.
        </p>
        <Button onClick={() => navigate("/paciente")} className="mt-4">
          Volver al panel
        </Button>
      </Card>
    );
  }

  // Buscamos la asignación del paciente.
  const asignaciones = obtenerMenusAsignados(user.id_usuario);
  const asignacion = asignaciones.find(
    (a) => a.id_asignacion === Number(idAsignacion)
  );

  if (!asignacion || !asignacion.menu) {
    return (
      <Card>
        <p className="text-sm text-content-muted">Menú no encontrado.</p>
        <Button onClick={() => navigate("/paciente")} className="mt-4">
          Volver al panel
        </Button>
      </Card>
    );
  }

  const alimentos = obtenerAlimentosDeMenu(asignacion.menu.id_menu);

  const handleSubmit = (e) => {
    e.preventDefault();
    registrarConsumo(idAsignacion, {
      estado_consumo: estadoConsumo,
      observaciones,
    });
    setMensaje("Consumo registrado correctamente.");
    // Redirigimos después de un segundo para que el usuario vea el mensaje.
    setTimeout(() => navigate("/paciente"), 1000);
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-content">Registrar consumo</h1>
        <p className="mt-1 text-sm text-content-muted">
          {asignacion.menu.nombre_menu} — {asignacion.dieta?.nombre_dieta}
        </p>
      </header>

      <Card className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-content-muted">
            Alimentos
          </p>
          <ul className="mt-2 space-y-1 text-sm text-content">
            {alimentos.map((a) => (
              <li key={a.id_alimento}>
                · {a.nombre_alimento} ({a.cantidad} {a.unidad_medida})
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-content">
              Estado del consumo
            </label>
            <select
              value={estadoConsumo}
              onChange={(e) => setEstadoConsumo(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="consumido">Consumido</option>
              <option value="parcial">Parcial</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-content">
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="¿Algún comentario sobre este menú?"
            />
          </div>

          {mensaje && <p className="text-sm text-green-600">{mensaje}</p>}

          <div className="flex gap-3">
            <Button type="submit" variant="health">
              Guardar consumo
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