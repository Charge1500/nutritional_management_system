import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReportTable } from '../../components/ReportTable';
import { useSortableData } from '../../hooks/useSortableData';
import { useReportData } from '../../hooks/useReportData';
import { getDietOptions, getGeneratedMenusByDiet } from '../../services/reportService';
import { formatDate, formatParameters } from '../../utils/reportFormatters';
import { exportTableToPdf } from '../../utils/exportToPdf';

// Definición de columnas fuera del componente: así mantiene la misma referencia entre renders.
// getText = texto mostrado y exportado a PDF; sortValue = valor real usado para ordenar.
const COLUMNS = [
  { key: 'name', label: 'Menú', getText: (row) => row.name },
  { key: 'creatorName', label: 'Creador', getText: (row) => row.creatorName },
  {
    key: 'createdAt',
    label: 'Fecha de creación',
    getText: (row) => formatDate(row.createdAt),
    sortValue: (row) => Date.parse(row.createdAt), // ordena por la fecha real, no por "dd/mm/aaaa"
  },
  { key: 'parameters', label: 'Parámetros utilizados', getText: (row) => formatParameters(row.parameters) },
];

export function ReportMenusByDiet() {
  const [diets, setDiets] = useState([]); // opciones del selector
  const [selectedDietId, setSelectedDietId] = useState(''); // '' = ninguna seleccionada
  const [optionsError, setOptionsError] = useState(''); // error al cargar las dietas
  const { rows, loading, error, load } = useReportData(getGeneratedMenusByDiet); // datos del reporte
  const { sortedRows, sortConfig, requestSort } = useSortableData(rows, COLUMNS); // orden por columna

  // Carga las dietas una sola vez al abrir la pantalla.
  useEffect(() => {
    let cancelled = false; // evita actualizar el estado si el usuario ya salió de la pantalla
    getDietOptions()
      .then((data) => { if (!cancelled) setDiets(data); })
      .catch(() => { if (!cancelled) setOptionsError('No se pudo cargar la lista de dietas.'); });
    return () => { cancelled = true; }; // limpieza al desmontar el componente
  }, []);

  const handleDietChange = (event) => {
    const requestedId = event.target.value;
    // Solo se acepta un id que exista en la lista (el DOM puede ser manipulado desde las herramientas del navegador).
    const dietId = diets.some((diet) => diet.id === requestedId) ? requestedId : '';
    setSelectedDietId(dietId);
    load(dietId); // consulta el reporte (o lo limpia si no hay selección)
  };

  const selectedDiet = diets.find((diet) => diet.id === selectedDietId); // dieta elegida (o undefined)
  const canExport = !loading && sortedRows.length > 0 && Boolean(selectedDiet); // ¿se puede exportar?

  const handleExport = () => {
    if (!canExport) return; // protección extra además del botón deshabilitado
    exportTableToPdf({
      title: 'Reporte 1: Menús generados automáticamente',
      subtitle: `Dieta: ${selectedDiet.name} - Generado el ${formatDate(new Date().toISOString())}`,
      columns: COLUMNS,
      rows: sortedRows, // se exporta con el mismo orden que el usuario ve en pantalla
      fileName: `reporte-1-menus-por-dieta-${selectedDiet.id}`,
    });
  };

  return (
    <section className="space-y-6">
      <header>
        <Link to="/reportes" className="text-sm font-medium text-health-600 hover:text-health-700 transition-colors">← Volver a reportes</Link>
        <h1 className="mt-2 text-2xl font-bold text-content">Reporte 1: Menús generados automáticamente</h1>
        <p className="text-sm text-content-muted">Selecciona una dieta para ver sus menús generados automáticamente.</p>
      </header>

      <div className="flex flex-wrap items-end gap-4 bg-surface p-6 rounded-xl shadow-soft border border-gray-100">
        <div>
          {/* htmlFor + id asocian la etiqueta con el selector (accesibilidad) */}
          <label htmlFor="report-diet" className="block text-xs font-medium text-content-muted mb-1">Dieta</label>
          <select
            id="report-diet"
            value={selectedDietId}
            onChange={handleDietChange}
            className="w-72 max-w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-health-500 focus:outline-none focus:ring-1 focus:ring-health-500"
          >
            <option value="">Selecciona una dieta...</option>
            {diets.map((diet) => (
              <option key={diet.id} value={diet.id}>{diet.name}</option>
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

      {/* role="alert" hace que los lectores de pantalla anuncien el error */}
      {optionsError && <p role="alert" className="text-sm text-red-600">{optionsError}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {loading && <p role="status" className="text-content-muted">Cargando reporte...</p>}

      {!selectedDietId && !loading && (
        <p className="text-sm text-content-muted">Selecciona una dieta para ver el reporte.</p>
      )}
      {selectedDietId && !loading && !error && (
        <ReportTable
          columns={COLUMNS}
          rows={sortedRows}
          sortConfig={sortConfig}
          onSort={requestSort}
          emptyMessage="Esta dieta no tiene menús generados automáticamente."
        />
      )}
    </section>
  );
}