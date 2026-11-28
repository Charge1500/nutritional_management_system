import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ReportTable } from "../../components/ReportTable";
import { useSortableData } from "../../hooks/useSortableData";
import { useReportData } from "../../hooks/useReportData";
import { getPerformanceByCaloricLevel } from "../../services/reportService";
import { exportTableToPdf } from "../../utils/exportToPdf";

const COLUMNS = [
  { key: "level", label: "Nivel calórico", getText: (row) => row.level },
  {
    key: "totalConsumptions",
    label: "Consumos totales",
    getText: (row) => row.totalConsumptions,
  },
  {
    key: "acceptedConsumptions",
    label: "Consumos aceptados",
    getText: (row) => row.acceptedConsumptions,
  },
  {
    key: "acceptanceRate",
    label: "Tasa de aceptación",
    getText: (row) => `${row.acceptanceRate}%`,
  },
  {
    key: "averageScore",
    label: "Puntuación promedio",
    getText: (row) => row.averageScore,
  },
];

export function ReportPerformanceByCaloricLevel() {
  const { rows, loading, error, load } = useReportData(
    getPerformanceByCaloricLevel
  );
  const { sortedRows, sortConfig, requestSort } = useSortableData(
    rows,
    COLUMNS
  );

  // Carga el reporte al montar el componente.
  useEffect(() => {
    load();
  }, [load]);

  const canExport = !loading && sortedRows.length > 0;

  const handleExport = () => {
    if (!canExport) return;
    exportTableToPdf({
      title: "Reporte 4: Desempeño por nivel calórico",
      subtitle: `Generado el ${new Date().toLocaleDateString("es-ES")}`,
      columns: COLUMNS,
      rows: sortedRows,
      fileName: "reporte-4-desempeno-calorico",
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
          Reporte 4: Desempeño por nivel calórico
        </h1>
        <p className="text-sm text-content-muted">
          Tasa de aceptación y puntuación promedio de los pacientes ante menús
          clasificados por nivel calórico.
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
        <ReportTable
          columns={COLUMNS}
          rows={sortedRows}
          sortConfig={sortConfig}
          onSort={requestSort}
          emptyMessage="No hay consumos registrados para calcular el reporte."
        />
      )}
    </section>
  );
}