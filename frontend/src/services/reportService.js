import {
  dietas,
  usuarios,
  menus,
  consumos,
  menusAsignados,
  contenidoMenuAlimento,
  alimentos,
  valoraciones,
} from '../data/mockData';

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
// ============================================================
// PATRÓN STRATEGY
// Cada función implementa una estrategia distinta de cálculo
// para un reporte. El componente del reporte solo llama a la
// estrategia y muestra el resultado.
// ============================================================

// Reporte 4: desempeño por nivel calórico.
// Agrupa los consumos por el nivel calórico predominante del menú,
// calcula la tasa de aceptación y la puntuación promedio.
export async function getPerformanceByCaloricLevel() {
  // 1. Agrupar los consumos por nivel calórico.
  const byLevel = {};

  consumos.forEach((consumption) => {
    // Buscamos la asignación del consumo.
    const assignment = menusAsignados.find(
      (a) => a.id_asignacion === consumption.id_asignacion
    );
    if (!assignment) return;

    // Buscamos el menú de la asignación.
    const menu = menus.find((m) => m.id_menu === assignment.id_menu);
    if (!menu) return;

    // Obtenemos los alimentos del menú.
    const menuFoods = contenidoMenuAlimento
      .filter((c) => c.id_menu === menu.id_menu)
      .map((c) => alimentos.find((a) => a.id_alimento === c.id_alimento))
      .filter(Boolean);

    if (menuFoods.length === 0) return;

    // Determinamos el nivel calórico predominante del menú.
    const levelCount = { bajo: 0, medio: 0, alto: 0 };
    menuFoods.forEach((food) => {
      if (levelCount[food.nivel_calorico] !== undefined) {
        levelCount[food.nivel_calorico] += 1;
      }
    });

    const predominantLevel = Object.entries(levelCount).sort(
      (a, b) => b[1] - a[1]
    )[0][0];

    // Inicializamos el nivel si no existe.
    if (!byLevel[predominantLevel]) {
      byLevel[predominantLevel] = {
        level: predominantLevel,
        totalConsumptions: 0,
        acceptedConsumptions: 0,
        scores: [],
      };
    }

    // Contamos el consumo.
    byLevel[predominantLevel].totalConsumptions += 1;

    // Un consumo es aceptado si el estado es "consumido".
    if (consumption.estado_consumo === 'consumido') {
      byLevel[predominantLevel].acceptedConsumptions += 1;
    }

    // Buscamos la puntuación del paciente para ese consumo.
    const patientScore = valoraciones.find(
      (v) => v.id_usuario === assignment.id_usuario
    );
    if (patientScore && patientScore.puntuacion != null) {
      byLevel[predominantLevel].scores.push(patientScore.puntuacion);
    }
  });

  // 2. Convertimos a array y calculamos métricas.
  const rows = Object.values(byLevel).map((item) => {
    const acceptanceRate =
      item.totalConsumptions > 0
        ? (item.acceptedConsumptions / item.totalConsumptions) * 100
        : 0;

    const averageScore =
      item.scores.length > 0
        ? item.scores.reduce((sum, s) => sum + s, 0) / item.scores.length
        : null;

    return {
      id: item.level,
      level: item.level,
      totalConsumptions: item.totalConsumptions,
      acceptedConsumptions: item.acceptedConsumptions,
      acceptanceRate: Number(acceptanceRate.toFixed(1)),
      averageScore: averageScore != null ? Number(averageScore.toFixed(1)) : '—',
    };
  });

  return simulateRequest(rows);
}