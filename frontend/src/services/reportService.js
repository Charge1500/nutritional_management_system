import { reportDiets, reportReviewers, generatedMenus } from '../data/reportMockData';

const SIMULATED_LATENCY_MS = 250; // retardo artificial para probar el estado "cargando"

// Devuelve una copia de los datos tras un retardo, como haría una petición HTTP real.
// La copia evita que la interfaz modifique por accidente los datos originales.
const simulateRequest = (payload) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(JSON.parse(JSON.stringify(payload))), SIMULATED_LATENCY_MS);
  });

// Rechaza identificadores vacíos o que no sean texto antes de consultar.
const assertValidId = (id, label) => {
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error(`${label} inválido`);
  }
};

// Al conectar el back end, cada función se reemplaza por una llamada axios, ej:
//  const { data } = await axios.get('/reports/menus-by-diet', { params: { diet_id: dietId } });
// (la ruta es ilustrativa: acordarla con el equipo de back end; "params" codifica el valor de forma segura).
// La autorización REAL por rol debe validarla FastAPI: ProtectedRoute solo oculta pantallas.

// Opciones del selector de dietas:
export async function getDietOptions() {
  return simulateRequest(reportDiets);
}

// Opciones del selector de revisores:
export async function getReviewerOptions() {
  return simulateRequest(reportReviewers);
}

// Reporte 1: menús generados automáticamente para una dieta.
export async function getGeneratedMenusByDiet(dietId) {
  assertValidId(dietId, 'Identificador de dieta');
  const rows = generatedMenus
    .filter((menu) => menu.origin === 'automatico' && menu.dietId === dietId) // solo automáticos de esa dieta
    .map(({ id, name, creatorName, createdAt, parameters }) => ({ id, name, creatorName, createdAt, parameters }));
  return simulateRequest(rows); // solo se devuelven los campos que el reporte necesita
}

// Reporte 3: menús validados por un revisor.
export async function getMenusValidatedByReviewer(reviewerId) {
  assertValidId(reviewerId, 'Identificador de revisor');
  const rows = generatedMenus
    .filter((menu) => menu.validation !== null && menu.validation.reviewerId === reviewerId) // solo los ya validados por él
    .map(({ id, name, validation }) => ({
      id,
      name,
      validatedAt: validation.validatedAt,
      observations: validation.observations,
      result: validation.result,
    }));
  return simulateRequest(rows);
}