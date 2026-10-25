// este archivo se encarga de la tabla interactiva adptada con Tailwind css

// Traduce la dirección de orden al valor que entienden los lectores de pantalla.
const ARIA_SORT = { asc: 'ascending', desc: 'descending' };

// columns: [{ key, label, getText, render? }]  rows: filas con id único
export function ReportTable({ columns, rows, sortConfig, onSort, emptyMessage = 'No hay datos para mostrar.' }) {
  return (
    // overflow-x-auto: en pantallas pequeñas la tabla se desplaza sin romper el diseño
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-surface shadow-soft">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => {
              const isSorted = sortConfig.key === column.key; // ¿es la columna ordenada actualmente?
              return (
                <th
                  key={column.key} // clave estable para React
                  scope="col" // indica que es encabezado de columna 
                  aria-sort={isSorted ? ARIA_SORT[sortConfig.direction] : 'none'} // estado del orden
                  className="px-4 py-3 font-semibold text-content"
                >
                  {/* El botón permite ordenar con teclado, no solo con el mouse */}
                  <button
                    type="button" // evita enviar formularios por accidente
                    onClick={() => onSort(column.key)} // pide ordenar por esta columna
                    className="inline-flex items-center gap-1 hover:text-health-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-health-500 transition-colors"
                  >
                    {column.label}
                    {/* aria-hidden: la flecha es solo decorativa; aria-sort ya informa el estado */}
                    <span aria-hidden="true" className="text-xs text-health-600">
                      {isSorted ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.length === 0 ? (
            <tr>
              {/* colSpan: una sola celda que ocupa todas las columnas */}
              <td colSpan={columns.length} className="px-4 py-6 text-center text-content-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const rowKey = row.id ?? row.id_menu ?? row.id_alimento ?? `row-${index}`;
              return (
                <tr key={rowKey} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 align-top text-content">
                      {column.render ? column.render(row) : column.getText(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}