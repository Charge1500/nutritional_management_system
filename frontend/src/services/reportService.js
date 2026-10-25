import { dietas, usuarios, menus } from '../data/mockData';

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

// Derivación de colecciones de reportes 
const reportDiets = dietas.map((d) => ({
  id: String(d.id_dieta),
  name: d.nombre_dieta,
}));

const reportReviewers = usuarios
  .filter((u) => u.rol === 'jefe' || u.rol === 'nutricionista')
  .map((u) => ({
    id: String(u.id_usuario),
    name: `${u.nombre} ${u.apellidos || ''}`.trim(),
  }));

const generatedMenus = menus.map((m) => {
  const creator = usuarios.find((u) => u.id_usuario === m.id_usuario_creador);
  const creatorName = creator ? `${creator.nombre} ${creator.apellidos || ''}`.trim() : 'Lic. Sistema';

  return {
    id: String(m.id_menu),
    name: m.nombre_menu,
    dietId: String(m.id_dieta),
    origin: m.id_menu === 5 ? 'manual' : 'automatico',
    creatorName,
    createdAt: m.fecha_creacion ? `${m.fecha_creacion}T10:30:00Z` : '2026-10-01T10:30:00Z',
    parameters: { targetCalories: 1800, mealsPerDay: 4, excludedGroups: [] },
    validation: m.fecha_validacion
      ? {
          reviewerId: reportReviewers[0]?.id || '1',
          validatedAt: `${m.fecha_validacion}T14:00:00Z`,
          result: m.estado_menu === 'rechazado' ? 'rechazado' : 'aprobado',
          observations: m.observaciones || '',
        }
      : null,
  };
});

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