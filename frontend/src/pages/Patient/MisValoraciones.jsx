// src/pages/Patient/MisValoraciones.jsx
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../hooks/useAuth";
import { obtenerValoracionesDePaciente } from "../../services/menuService";
import { Card } from "../../components/Card";

// Calcula el IMC a partir del peso (kg) y la altura (m).
const calcularIMC = (peso, altura) => {
  if (!peso || !altura) return null;
  return peso / (altura * altura);
};

// Formatea una fecha ISO (YYYY-MM-DD) a dd/mm/aaaa.
const formatearFecha = (isoString) => {
  if (!isoString) return "—";
  const [year, month, day] = isoString.split("-");
  return `${day}/${month}/${year}`;
};

export const MisValoraciones = () => {
  const { user } = useAuth();

  // Obtenemos las valoraciones (ya vienen ordenadas por fecha ascendente).
  const valoraciones = useMemo(
    () => (user ? obtenerValoracionesDePaciente(user.id_usuario) : []),
    [user]
  );

  // Si no hay usuario, mostramos un aviso.
  if (!user) {
    return (
      <Card>
        <p className="text-sm text-content-muted">No se encontró el usuario.</p>
      </Card>
    );
  }

  // Si no hay valoraciones, mostramos un aviso.
  if (valoraciones.length === 0) {
    return (
      <section className="mx-auto max-w-7xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-content">Mis valoraciones</h1>
        </header>
        <Card className="py-10 text-center">
          <p className="text-sm text-content-muted">
            Aún no tienes valoraciones registradas.
          </p>
        </Card>
      </section>
    );
  }

  // La primera y la última valoración (para el resumen).
  const primera = valoraciones[0];
  const ultima = valoraciones[valoraciones.length - 1];

  // Cálculos del resumen.
  const pesoInicial = primera.peso;
  const pesoActual = ultima.peso;
  const variacion = pesoActual - pesoInicial;
  const imcActual = calcularIMC(ultima.peso, ultima.altura);

  // Datos para el gráfico de evolución del peso.
  const datosGrafico = valoraciones.map((v) => ({
    fecha: formatearFecha(v.fecha_valoracion),
    peso: v.peso,
  }));

  return (
    <section className="mx-auto max-w-7xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-content">Mis valoraciones</h1>
        <p className="mt-1 text-sm text-content-muted">
          Historial de valoraciones nutricionales recibidas.
        </p>
      </header>

      {/* Resumen */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-health-500/10">
            <span className="text-2xl text-health-500">↓</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-content">{pesoInicial} kg</p>
            <p className="text-sm text-content-muted">Peso inicial</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-health-500/10">
            <span className="text-2xl text-health-500">↑</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-content">{pesoActual} kg</p>
            <p className="text-sm text-content-muted">Peso actual</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-health-500/10">
            <span className="text-2xl text-health-500">Δ</span>
          </div>
          <div>
            <p
              className={`text-2xl font-bold ${
                variacion < 0
                  ? "text-green-600"
                  : variacion > 0
                  ? "text-red-600"
                  : "text-content"
              }`}
            >
              {variacion > 0 ? "+" : ""}
              {variacion.toFixed(1)} kg
            </p>
            <p className="text-sm text-content-muted">Variación total</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-health-500/10">
            <span className="text-2xl text-health-500">⚖</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-content">
              {imcActual ? imcActual.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-content-muted">IMC actual</p>
          </div>
        </Card>
      </section>

      {/* Gráfico de evolución del peso */}
      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-bold text-content sm:text-2xl">
            Evolución del peso
          </h2>
        </header>

        <Card className="p-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosGrafico} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "kg",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12 },
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value} kg`, "Peso"]}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ fill: "#059669", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Tabla detallada */}
      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-bold text-content sm:text-2xl">
            Detalle de valoraciones
          </h2>
        </header>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-content-muted">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Nutricionista</th>
                  <th className="px-4 py-3">Peso</th>
                  <th className="px-4 py-3">Altura</th>
                  <th className="px-4 py-3">IMC</th>
                  <th className="px-4 py-3">Variación</th>
                  <th className="px-4 py-3">Observaciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {valoraciones.map((valoracion, index) => {
                  const imc = calcularIMC(valoracion.peso, valoracion.altura);
                  // Variación respecto a la valoración anterior (la primera no tiene).
                  const anterior = index > 0 ? valoraciones[index - 1] : null;
                  const variacionFila = anterior
                    ? valoracion.peso - anterior.peso
                    : null;

                  return (
                    <tr key={valoracion.id_valoracion}>
                      <td className="px-4 py-3 text-content">
                        {formatearFecha(valoracion.fecha_valoracion)}
                      </td>

                      <td className="px-4 py-3 text-content-muted">
                        {valoracion.nutricionista
                          ? `${valoracion.nutricionista.nombre} ${valoracion.nutricionista.apellidos}`
                          : "—"}
                      </td>

                      <td className="px-4 py-3 text-content">
                        {valoracion.peso} kg
                      </td>

                      <td className="px-4 py-3 text-content">
                        {valoracion.altura} m
                      </td>

                      <td className="px-4 py-3 text-content">
                        {imc ? imc.toFixed(1) : "—"}
                      </td>

                      <td
                        className={`px-4 py-3 font-medium ${
                          variacionFila === null
                            ? "text-content-muted"
                            : variacionFila < 0
                            ? "text-green-600"
                            : variacionFila > 0
                            ? "text-red-600"
                            : "text-content"
                        }`}
                      >
                        {variacionFila === null
                          ? "—"
                          : `${variacionFila > 0 ? "+" : ""}${variacionFila.toFixed(1)} kg`}
                      </td>

                      <td className="px-4 py-3 text-content-muted">
                        {valoracion.observaciones || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </section>
  );
};