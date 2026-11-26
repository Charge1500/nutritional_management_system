// src/pages/Reports/ReportTop10Rejection.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ReportTable } from "../../components/ReportTable";
import { useSortableData } from "../../hooks/useSortableData";
import { useReportData } from "../../hooks/useReportData";
import { getTop10FoodsByRejectionRate } from "../../services/reportService";
import { exportTableToPdf } from "../../utils/exportToPdf";

const COLUMNS = [
  { key: "nombre_alimento", label: "Alimento", getText: (row) => row.nombre_alimento },
  { key: "nivel_calorico", label: "Nivel calórico", getText: (row) => row.nivel_calorico },
  {
    key: "nutricionista_creador",
    label: "Nutricionista creador",
    getText: (row) => row.nutricionista_creador,
  },
  { key: "dieta_asociada", label: "Dieta asociada", getText: (row) => row.dieta_asociada },
  {
    key: "appearances",
    label: "Apariciones",
    getText: (row) => row.appearances,
    sortValue: (row) => row.appearances,
  },
  {
    key: "rejections",
    label: "Rechazos",
    getText: (row) => row.rejections,
    sortValue: (row) => row.rejections,
  },
  {
    key: "tasa_rechazo",
    label: "Tasa de rechazo (%)",
    getText: (row) => `${row.tasa_rechazo.toFixed(2)} %`,
    sortValue: (row) => row.tasa_rechazo,
  },
];

export function ReportTop10Rejection() {
  const { rows, loading, error, load } = useReportData(getTop10FoodsByRejectionRate);
  const { sortedRows, sortConfig, requestSort } = useSortableData(rows, COLUMNS);

  useEffect(() => {
    load(); // no parameter: useReportData already distinguishes parameterless fetchers
  }, [load]);

  const canExport = !loading && sortedRows.length > 0;

  const handleExport = () => {
    if (!canExport) return;
    exportTableToPdf({
      title: "Reporte 6.2: Top 10 alimentos con mayor tasa de rechazo",
      subtitle: `Generado el ${new Date().toLocaleDateString("es-ES")} — Rechazo = 100 − tasa de aceptación (consumos del paciente)`,
      columns: COLUMNS,
      rows: sortedRows,
      fileName: "reporte-6-2-top-10-rechazo",
    });
  };

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
          Reporte 6.2: Top 10 alimentos con mayor tasa de rechazo
        </h1>
        <p className="text-sm text-content-muted">
          La tasa de rechazo se calcula como <strong>100 − tasa de aceptación</strong> usando los
          consumos de los pacientes: <em>parcial</em> cuenta como rechazo y <em>pendiente</em> se
          excluye. El rechazo del jefe no interviene en el cálculo.
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
            emptyMessage="No hay alimentos con suficientes apariciones para calcular el rechazo."
          />

          {sortedRows.length > 0 && (
            <div className="bg-surface p-6 rounded-xl shadow-soft border border-gray-100">
              <h2 className="text-lg font-semibold text-content mb-4">
                Comparativa de tasa de rechazo
              </h2>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart
                  data={sortedRows}
                  layout="vertical"
                  margin={{ left: 140, right: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" unit="%" domain={[0, 100]} />
                  <YAxis type="category" dataKey="nombre_alimento" width={130} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)} %`} />
                  <Bar dataKey="tasa_rechazo" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </section>
  );
}