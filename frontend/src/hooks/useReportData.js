// este archivo gestiona los estados de carga, errores  y concurrencia asíncrona

import { useCallback, useRef, useState } from 'react';

// Maneja carga, error y datos de un reporte que depende de un parámetro (dieta o revisor).
// fetchReport debe ser una función estable (importada de un módulo, no creada dentro del componente).
export function useReportData(fetchReport) {
  const [rows, setRows] = useState([]); // filas del reporte
  const [loading, setLoading] = useState(false); // true mientras se espera la respuesta
  const [error, setError] = useState(''); // mensaje de error para el usuario
  const requestIdRef = useRef(0); // número de la última petición lanzada

  const load = useCallback(async (param) => {
    requestIdRef.current += 1; 
    // con requestIdRef cada petición nueva invalida las anteriores: si el usuario cambia rápidamente de selección,
    // una respuesta lenta para la selección anterior podría sobreescribir la nueva.
    const requestId = requestIdRef.current;
    setRows([]); // limpia la tabla anterior
    setError(''); // limpia el error anterior
    if (!param) { // si no hay selección, no se consulta nada
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchReport(param); // llamada al servicio
      if (requestId === requestIdRef.current) setRows(data); // solo se acepta si sigue siendo la última
    } catch {
      // No se muestra el detalle técnico del error al usuario.
      if (requestId === requestIdRef.current) setError('No se pudo cargar el reporte. Intenta de nuevo.');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [fetchReport]);

  return { rows, loading, error, load };
}