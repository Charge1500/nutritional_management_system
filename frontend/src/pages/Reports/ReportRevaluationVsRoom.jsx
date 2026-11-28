// src/pages/Reports/ReportRevaluationVsRoom.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ReportTable } from "../../components/ReportTable";
import { useSortableData } from "../../hooks/useSortableData";
import { useReportData } from "../../hooks/useReportData";
import { getRevaluationVsRoomAverage } from "../../services/reportService";
import { exportTableToPdf } from "../../utils/exportToPdf";

const COLUMNS = [
  { key: "sala", label: "Sala", getText: (row) => row.sala },
  {
    key: "generalAverage",
    label: "Promedio general (%)",
    getText: (row) => (row.generalAverage != null ? `${row.generalAverage.toFixed(1)} %` : "—"),
    sortValue: (row) => (row.generalAverage != null ? row.generalAverage : null),
  },
  {
    key: "revaluationAverage",
    label: "Promedio revalorización (%)",
    getText: (row) => (row.revaluationAverage != null ? `${row.revaluationAverage.toFixed(1)} %` : "—"),
    sortValue: (row) => (row.revaluationAverage != null ? row.revaluationAverage : null),
  },
  {
    key: "difference",
    label: "Diferencia (pp)",
    getText: (row) => (row.difference != null ? `${row.difference.toFixed(1)}` : "—"),
    sortValue: (row) => (row.difference != null ? row.difference : null),
  },
  {
    key: "patientsCount",
    label: "Pacientes",
    getText: (row) => row.patientsCount,
    sortValue: (row) => row.patientsCount,
  },
  {
    key: "revaluationPatientsCount",
    label: "En revalorización",
    getText: (row) => row.revaluationPatientsCount,
    sortValue: (row) => row.revaluationPatientsCount,
  },
];

// Build chart data: only rooms with both averages.
function buildChartData(rows) {
  return rows
    .filter((r) => r.generalAverage != null && r.revaluationAverage != null)
    .map((r) => ({
      sala: r.sala,
      General: r.generalAverage,
      Revalorización: r.revaluationAverage,
    }));
}

export function ReportRevaluationVsRoom() {
  const { rows, loading, error, load } = useReportData(getRevaluationVsRoomAverage);
  const { sortedRows, sortConfig, requestSort } = useSortableData(rows, COLUMNS);

  useEffect(() => {
    load();
  }, [load]);

  const canExport = !loading && sortedRows.length > 0;

  const handleExport = () => {
    if (!canExport) return;
    exportTableToPdf({
      title: "Reporte 6.3: Revalorización vs. promedio de sala",
      subtitle: `Generado el ${new Date().toLocaleDateString("es-ES")} — Tasa de aceptación basada en consumos del paciente`,
      columns: COLUMNS,
      rows: sortedRows,
      fileName: "reporte-6-3-revalorizacion-vs-sala",
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
          Reporte 6.3: Revalorización vs. promedio de sala
        </h1>
        <p className="text-sm text-content-muted">
          Compara la tasa de aceptación de los pacientes en revalorización con el
          promedio del resto de pacientes de la misma sala. La tasa se calcula a partir
          de los consumos registrados (<em>parcial</em> cuenta como rechazo).
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
            emptyMessage="No hay salas con datos suficientes para comparar."
          />

          {chartData.length > 0 && (
            <div className="bg-surface p-6 rounded-xl shadow-soft border border-gray-100">
              <h2 className="text-lg font-semibold text-content mb-4">
                Promedio general vs. revalorización por sala
              </h2>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sala" />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)} %`} />
                  <Legend />
                  <Bar dataKey="General" fill="#059669" />
                  <Bar dataKey="Revalorización" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </section>
  );
}