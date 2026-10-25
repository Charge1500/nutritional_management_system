// Aquí se traducen las claves técnicas (parámetros de generación) a etiquetas legibles y formatea las fechas de forma segura.

// Object.freeze evita que otro módulo las modifique por accidente.
const PARAMETER_LABELS = Object.freeze({
  targetCalories: 'Calorías objetivo',
  mealsPerDay: 'Comidas por día',
  excludedGroups: 'Grupos excluidos',
  maxRepeatDays: 'Máx. días de repetición',
  proporcion_preparacion: 'Proporción de preparación',
});


export function formatDate(isoString) {
  if (!isoString) return '-';

  // Si la cadena es formato solo fecha YYYY-MM-DD (ej: "2026-10-02")
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    const [year, month, day] = isoString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Si la cadena contiene marca ISO/Hora completa
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function stringifyValue(val) {
  if (val === null || val === undefined) return 'Ninguno';
  if (Array.isArray(val)) return val.length > 0 ? val.map(stringifyValue).join(', ') : 'Ninguno';
  if (typeof val === 'object') {
    const pairs = Object.entries(val).map(([k, v]) => `${k}: ${stringifyValue(v)}`);
    return pairs.length > 0 ? pairs.join(', ') : 'Ninguno';
  }
  return String(val);
}


export function formatParameters(parameters) {
  if (!parameters) return 'Sin parámetros'; // valor ausente o de tipo inesperado
  if (typeof parameters == 'string') return parameters; 
  if (typeof parameters !== 'object') return String(parameters); 
  
  const entries = Object.entries(parameters); // lista de pares [clave, valor]
  if (entries.length === 0) return 'Sin parámetros'; // objeto vacío

  return entries
    .map(([key, value]) => {
      // hasOwn evita leer claves heredadas como "toString" 
      const label = Object.hasOwn(PARAMETER_LABELS, key) ? PARAMETER_LABELS[key] : key;
return `${label}: ${stringifyValue(value)}`;
    })
    .join(' | ');
}