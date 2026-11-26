import {
  dietas,
  usuarios,
  menus,
  consumos,
  menusAsignados,
  contenidoMenuAlimento,
  alimentos,
  valoraciones,
  inscripcionesPacienteDieta,
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


// Devuelve el nivel calórico predominante de un menú (moda de los
// niveles de sus alimentos). Desempate: bajo > medio > alto, igual
// que en el Reporte 4. Devuelve null si el menú no tiene alimentos.
export function getPredominantCaloricLevel(menu) {
  const menuFoods = contenidoMenuAlimento
    .filter((c) => c.id_menu === menu.id_menu)
    .map((c) => alimentos.find((a) => a.id_alimento === c.id_alimento))
    .filter(Boolean);

  if (menuFoods.length === 0) return null;

  const levelCount = { bajo: 0, medio: 0, alto: 0 };
  menuFoods.forEach((food) => {
    if (levelCount[food.nivel_calorico] !== undefined) {
      levelCount[food.nivel_calorico] += 1;
    }
  });

  return Object.entries(levelCount).sort((a, b) => b[1] - a[1])[0][0];
}

// Reporte 4: desempeño por nivel calórico.
export async function getPerformanceByCaloricLevel() {
  const byLevel = {};

  consumos.forEach((consumption) => {
    const assignment = menusAsignados.find(
      (a) => a.id_asignacion === consumption.id_asignacion
    );
    if (!assignment) return;

    const menu = menus.find((m) => m.id_menu === assignment.id_menu);
    if (!menu) return;

    // Usa el helper compartido
    const predominantLevel = getPredominantCaloricLevel(menu);
    if (!predominantLevel) return;

    if (!byLevel[predominantLevel]) {
      byLevel[predominantLevel] = {
        level: predominantLevel,
        totalConsumptions: 0,
        acceptedConsumptions: 0,
        scores: [],
      };
    }

    byLevel[predominantLevel].totalConsumptions += 1;
    if (consumption.estado_consumo === 'consumido') {
      byLevel[predominantLevel].acceptedConsumptions += 1;
    }

    const patientScore = valoraciones.find(
      (v) => v.id_usuario === assignment.id_usuario
    );
    if (patientScore && patientScore.puntuacion != null) {
      byLevel[predominantLevel].scores.push(patientScore.puntuacion);
    }
  });

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
// ============================================================
// Reporte 6.1 — Correlación de nivel calórico vs. resultado
// nutricional por dieta (RF-23 / RI-06)
// ============================================================

const CALORIC_LEVEL_CODE = { bajo: 1, medio: 2, alto: 3 };
export const MIN_VALORACIONES_CORRELACION = 2;

const ONLY_APPROVED_MENUS_61 = true;
const ONLY_ACTIVE_ASSIGNMENTS_61 = true;

function pearsonCorrelation(xs, ys) {
  const n = xs.length;
  if (n < 2 || n !== ys.length) return null;

  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  if (denX === 0 || denY === 0) return null;
  return num / Math.sqrt(denX * denY);
}

export async function getCaloricCorrelationByDiet() {
  const rows = [];

  for (const dieta of dietas) {
    const dietId = dieta.id_dieta;

    const enrolledPatientIds = new Set(
      inscripcionesPacienteDieta
        .filter((i) => i.id_dieta === dietId)
        .map((i) => i.id_usuario)
    );

    const validAssignments = menusAsignados.filter((asg) => {
      if (ONLY_ACTIVE_ASSIGNMENTS_61 && asg.estado_asignacion !== 'activo') return false;
      if (!enrolledPatientIds.has(asg.id_usuario)) return false;
      const menu = menus.find((m) => m.id_menu === asg.id_menu);
      if (!menu || menu.id_dieta !== dietId) return false;
      if (ONLY_APPROVED_MENUS_61 && menu.estado_menu !== 'aprobado') return false;
      return true;
    });

    const latestAssignmentByPatient = new Map();
    for (const asg of validAssignments) {
      const prev = latestAssignmentByPatient.get(asg.id_usuario);
      if (
        !prev ||
        asg.fecha_asignacion > prev.fecha_asignacion ||
        (asg.fecha_asignacion === prev.fecha_asignacion && asg.id_asignacion > prev.id_asignacion)
      ) {
        latestAssignmentByPatient.set(asg.id_usuario, asg);
      }
    }

    const pairs = [];
    const byLevel = {
      bajo: { sum: 0, count: 0 },
      medio: { sum: 0, count: 0 },
      alto: { sum: 0, count: 0 },
    };

    for (const [patientId, asg] of latestAssignmentByPatient.entries()) {
      const menu = menus.find((m) => m.id_menu === asg.id_menu);
      if (!menu) continue;
      const level = getPredominantCaloricLevel(menu);
      if (!level || CALORIC_LEVEL_CODE[level] === undefined) continue;

      const patientValuations = valoraciones.filter(
        (v) => v.id_usuario === patientId && v.puntuacion != null
      );

      for (const v of patientValuations) {
        const score = Number(v.puntuacion);
        pairs.push([CALORIC_LEVEL_CODE[level], score]);
        byLevel[level].sum += score;
        byLevel[level].count += 1;
      }
    }

    const totalValuations = pairs.length;

    if (totalValuations < MIN_VALORACIONES_CORRELACION) {
      rows.push({
        id: String(dietId),
        dieta: dieta.nombre_dieta,
        promedioBajo: '—',
        promedioMedio: '—',
        promedioAlto: '—',
        pearson: null,
        totalValoraciones: totalValuations,
        insufficient: true,
      });
      continue;
    }

    const avg = (lvl) =>
      byLevel[lvl].count > 0
        ? Number((byLevel[lvl].sum / byLevel[lvl].count).toFixed(1))
        : '—';

    const xs = pairs.map((p) => p[0]);
    const ys = pairs.map((p) => p[1]);
    const r = pearsonCorrelation(xs, ys);

    rows.push({
      id: String(dietId),
      dieta: dieta.nombre_dieta,
      promedioBajo: avg('bajo'),
      promedioMedio: avg('medio'),
      promedioAlto: avg('alto'),
      pearson: r != null ? Number(r.toFixed(3)) : null,
      totalValoraciones: totalValuations,
      insufficient: false,
    });
  }

  return simulateRequest(rows);
}
