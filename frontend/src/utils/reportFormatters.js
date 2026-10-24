// Aquí se traducen las claves técnicas (parámetros de generación) a etiquetas legibles y formatea las fechas de forma segura.

// Object.freeze evita que otro módulo las modifique por accidente.
const PARAMETER_LABELS = Object.freeze({
  targetCalories: 'Calorías objetivo',
  mealsPerDay: 'Comidas por día',
  excludedGroups: 'Grupos excluidos',
  maxRepeatDays: 'Máx. días de repetición',
  proporcion_preparacion: 'Proporción de preparación',
});

// Convierte una fecha ISO o string en formato local (ej. "2026-09-14T10:30:00Z" en "14/09/2026").
export function formatDate(isoString) {
  if (!isoString) return '-'; // new Date(null) daría 1970, por eso se descarta antes
  const date = new Date(isoString); // intenta interpretar el texto como fecha
  if (Number.isNaN(date.getTime())) return '-'; // fecha inválida: no se muestra "Invalid Date"
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric', // año completo
  });
}

// Convierte el objeto o texto de parámetros en una sola línea de texto legible.
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

      // Las listas se unen con comas, una lista vacía se muestra como "Ninguno".
      const text = Array.isArray(value)
        ? (value.length > 0 ? value.join(', ') : 'Ninguno')
        : String(value); // cualquier otro valor se convierte a texto
      return `${label}: ${text}`; // ej. "Calorías objetivo: 1500"
    })
    .join(' | '); // separa los parámetros con una barra vertical
}