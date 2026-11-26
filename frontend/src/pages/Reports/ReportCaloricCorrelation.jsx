// src/pages/Reports/ReportCaloricCorrelation.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ReportTable } from "../../components/ReportTable";
import { useSortableData } from "../../hooks/useSortableData";
import { useReportData } from "../../hooks/useReportData";
import { getCaloricCorrelationByDiet } from "../../services/reportService";
import { exportTableToPdf } from "../../utils/exportToPdf";

const COLUMNS = [
  { key: "dieta", label: "Dieta", getText: (row) => row.dieta },
  { key: "promedioBajo", label: "Prom. nivel bajo", getText: (row) => row.promedioBajo },
  { key: "promedioMedio", label: "Prom. nivel medio", getText: (row) => row.promedioMedio },
  { key: "promedioAlto", label: "Prom. nivel alto", getText: (row) => row.promedioAlto },
  {
    key: "pearson",
    label: "Pearson (r)",
    getText: (row) => (row.pearson != null ? row.pearson.toFixed(3) : "—"),
    sortValue: (row) => (row.pearson != null ? row.pearson : null),
  },
  {
    key: "totalValoraciones",
    label: "Valoraciones",
    getText: (row) => (row.insufficient ? `${row.totalValoraciones} (insuf.)` : row.totalValoraciones),
    sortValue: (row) => row.totalValoraciones,
  },
];

function buildChartData(rows) {
  return rows
    .filter((r) => !r.insufficient)
    .map((r) => ({
      dieta: r.dieta,
      Bajo: typeof r.promedioBajo === "number" ? r.promedioBajo : 0,
      Medio: typeof r.promedioMedio === "number" ? r.promedioMedio : 0,
      Alto: typeof r.promedioAlto === "number" ? r.promedioAlto : 0,
    }));
}

export function ReportCaloricCorrelation() {
  const { rows, loading, error, load } = useReportData(getCaloricCorrelationByDiet);
  const { sortedRows, sortConfig, requestSort } = useSortableData(rows, COLUMNS);

  useEffect(() => {
    load(); // sin parámetro: useReportData ya distingue funciones sin parámetro
  }, [load]);

  const canExport = !loading && sortedRows.length > 0;

  const handleExport = () => {
    if (!canExport) return;
    exportTableToPdf({
      title: "Reporte 6.1: Correlación de nivel calórico vs. resultado nutricional",
      subtitle: `Generado el ${new Date().toLocaleDateString("es-ES")} — Pearson entre nivel (1/2/3) y puntuación`,
      columns: COLUMNS,
      rows: sortedRows,
      fileName: "reporte-6-1-correlacion-calorica",
    });
  };

  const chartData = buildChartData(sortedRows);

  return (
    <section className="space-y-6">
      <header>
        <Link
          to="/reportes"
          className="text-sm font-medium text-health-600 hover:text-health-700 transition-colors"
        >
          ← Volver a reportes
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-content">
          Reporte 6.1: Correlación de nivel calórico vs. resultado nutricional
        </h1>
        <p className="text-sm text-content-muted">
          Por dieta, puntuación promedio de las valoraciones asociadas a menús de nivel
          bajo, medio y alto, y coeficiente de Pearson entre el nivel calórico
          codificado (1/2/3) y la puntuación. Se requieren al menos 2 valoraciones
          por dieta.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4 bg-surface p-6 rounded-xl shadow-soft border border-gray-100">
        <button
          type="button"
          onClick={handleExport}
          disabled={!canExport}
          className="rounded-lg bg-health-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-health-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          Exportar a PDF
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {loading && (
        <p role="status" className="text-content-muted">
          Cargando reporte...
        </p>
      )}

      {!loading && !error && (
        <>
          <ReportTable
            columns={COLUMNS}
            rows={sortedRows}
            sortConfig={sortConfig}
            onSort={requestSort}
            emptyMessage="No hay dietas con suficientes valoraciones para calcular la correlación."
          />

          {chartData.length > 0 && (
            <div className="bg-surface p-6 rounded-xl shadow-soft border border-gray-100">
              <h2 className="text-lg font-semibold text-content mb-4">
                Puntuación promedio por nivel calórico y dieta
              </h2>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dieta" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Bajo" fill="#22c55e" />
                  <Bar dataKey="Medio" fill="#f59e0b" />
                  <Bar dataKey="Alto" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </section>
  );
}