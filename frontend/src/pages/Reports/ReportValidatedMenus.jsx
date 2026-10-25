import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReportTable } from '../../components/ReportTable';
import { useSortableData } from '../../hooks/useSortableData';
import { useReportData } from '../../hooks/useReportData';
import { getReviewerOptions, getMenusValidatedByReviewer } from '../../services/reportService';
import { formatDate } from '../../utils/reportFormatters';
import { exportTableToPdf } from '../../utils/exportToPdf';


const RESULT_LABELS = Object.freeze({ aprobado: 'Aprobado', rechazado: 'Rechazado' });
const RESULT_STYLES = Object.freeze({
  aprobado: 'bg-health-50 text-health-700 border border-health-200',
  rechazado: 'bg-red-50 text-red-700 border border-red-200',
});

// Devuelve la etiqueta del resultado, o "-" si llega un estado desconocido.
const getResultLabel = (result) => (Object.hasOwn(RESULT_LABELS, result) ? RESULT_LABELS[result] : '-');

const COLUMNS = [
  { key: 'name', label: 'Menú', getText: (row) => row.name },
  {
    key: 'validatedAt',
    label: 'Fecha de validación',
    getText: (row) => formatDate(row.validatedAt),
    sortValue: (row) => Date.parse(row.validatedAt), // ordena por la fecha real
  },
  {
    key: 'result',
    label: 'Resultado',
    getText: (row) => getResultLabel(row.result), // texto plano para PDF y orden
    render: (row) => ( // insignia de color solo para la pantalla
      <span
        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
          Object.hasOwn(RESULT_STYLES, row.result) ? RESULT_STYLES[row.result] : 'bg-gray-100 text-gray-700'
        }`}
      >
        {getResultLabel(row.result)}
      </span>
    ),
  },
  {
    key: 'observations',
    label: 'Observaciones',
    getText: (row) => (row.observations && row.observations.trim() !== '' ? row.observations : 'Sin observaciones'),
  },
];

export function ReportValidatedMenus() {
  const [reviewers, setReviewers] = useState([]); // opciones del selector
  const [selectedReviewerId, setSelectedReviewerId] = useState(''); // '' = ninguno seleccionado
  const [optionsError, setOptionsError] = useState('');
  const { rows, loading, error, load } = useReportData(getMenusValidatedByReviewer);
  const { sortedRows, sortConfig, requestSort } = useSortableData(rows, COLUMNS);

  // Carga los revisores una sola vez al abrir la pantalla.
  useEffect(() => {
    let cancelled = false;
    getReviewerOptions()
      .then((data) => { if (!cancelled) setReviewers(data); })
      .catch(() => { if (!cancelled) setOptionsError('No se pudo cargar la lista de revisores.'); });
    return () => { cancelled = true; };
  }, []);

  const handleReviewerChange = (event) => {
    const requestedId = event.target.value;
    // Solo se acepta un id presente en la lista cargada.
    const reviewerId = reviewers.some((reviewer) => reviewer.id === requestedId) ? requestedId : '';
    setSelectedReviewerId(reviewerId);
    load(reviewerId);
  };

  const selectedReviewer = reviewers.find((reviewer) => reviewer.id === selectedReviewerId);
  const canExport = !loading && sortedRows.length > 0 && Boolean(selectedReviewer);

  const handleExport = () => {
    if (!canExport) return;
    exportTableToPdf({
      title: 'Reporte 3: Menús validados por revisor',
      subtitle: `Revisor: ${selectedReviewer.name} - Generado el ${formatDate(new Date().toISOString())}`,
      columns: COLUMNS,
      rows: sortedRows,
      fileName: `reporte-3-menus-validados-${selectedReviewer.id}`,
    });
  };

  return (
    <section className="space-y-6">
      <header>
        <Link to="/reportes" className="text-sm font-medium text-health-600 hover:text-health-700 transition-colors">← Volver a reportes</Link>
        <h1 className="mt-2 text-2xl font-bold text-content">Reporte 3: Menús validados por revisor</h1>
        <p className="text-sm text-content-muted">Selecciona un revisor para ver los menús que validó.</p>
      </header>

      <div className="flex flex-wrap items-end gap-4 bg-surface p-6 rounded-xl shadow-soft border border-gray-100">
        <div>
          <label htmlFor="report-reviewer" className="block text-xs font-medium text-content-muted mb-1">Revisor</label>
          <select
            id="report-reviewer"
            value={selectedReviewerId}
            onChange={handleReviewerChange}
            className="w-72 max-w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-health-500 focus:outline-none focus:ring-1 focus:ring-health-500"
          >
            <option value="">Selecciona un revisor...</option>
            {reviewers.map((reviewer) => (
              <option key={reviewer.id} value={reviewer.id}>{reviewer.name}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={!canExport}
          className="rounded-lg bg-health-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-health-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          Exportar a PDF
        </button>
      </div>

      {optionsError && <p role="alert" className="text-sm text-red-600">{optionsError}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {loading && <p role="status" className="text-content-muted">Cargando reporte...</p>}

      {!selectedReviewerId && !loading && (
        <p className="text-sm text-content-muted">Selecciona un revisor para ver el reporte.</p>
      )}
      {selectedReviewerId && !loading && !error && (
        <ReportTable
          columns={COLUMNS}
          rows={sortedRows}
          sortConfig={sortConfig}
          onSort={requestSort}
          emptyMessage="Este revisor aún no ha validado menús."
        />
      )}
    </section>
  );
}