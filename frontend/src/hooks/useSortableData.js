// este archivo es un hook reutilizable para ordenar tablas dinámicamente por columnas de texto o numéricas

import { useMemo, useState } from 'react';

// Un valor vacío siempre se manda al final, sin importar el sentido del orden.
const isEmpty = (value) => value === null || value === undefined || Number.isNaN(value);

// Compara dos valores no vacíos.
const compareValues = (a, b) => {
  if (typeof a === 'number' && typeof b === 'number') return a - b; // números: resta directa

  // Texto: localeCompare respeta tildes y la ñ; numeric ordena "2" antes de "10".
  return String(a).localeCompare(String(b), 'es', { numeric: true, sensitivity: 'base' });
};

// rows: filas a ordenar.
// columns: [{ key, getText, sortValue? }]; sortValue permite ordenar por algo distinto al texto mostrado (ej. la fecha real y no "14/09/2026").
export function useSortableData(rows, columns) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // sin orden al inicio

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return rows; // sin columna elegida se respeta el orden original
    const column = columns.find((col) => col.key === sortConfig.key); // columna activa

    if (!column) return rows; // clave desconocida: no se ordena
    const getValue = column.sortValue ?? column.getText; // valor usado para comparar
    const factor = sortConfig.direction === 'asc' ? 1 : -1; // invierte el resultado si es descendente

    return [...rows].sort((rowA, rowB) => { // se copia el arreglo: sort() modifica el original
      const a = getValue(rowA);
      const b = getValue(rowB);

      if (isEmpty(a) && isEmpty(b)) return 0; // ambos vacíos: iguales
      if (isEmpty(a)) return 1; // vacío al final
      if (isEmpty(b)) return -1;
      return factor * compareValues(a, b); // comparación normal con el sentido elegido
    });
  }, [rows, columns, sortConfig]); // se recalcula solo si cambia alguno de estos

  // Primer clic en una columna: ascendente. Clics siguientes: alterna asc/desc.
  const requestSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return { sortedRows, sortConfig, requestSort };
}