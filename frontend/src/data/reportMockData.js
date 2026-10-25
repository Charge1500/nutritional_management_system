// estos son datos de prueba solo para los reportes temporales, los reemplazará el back end (FastAPI).
// Los ids deben coincidir con los de mockData.js cuando se integren dietas y usuarios reales.

export const reportDiets = [
  { id: 'diet-1', name: 'Dieta hipocalórica' },
  { id: 'diet-2', name: 'Dieta para diabéticos' },
  { id: 'diet-3', name: 'Dieta hiperproteica' },
];

// Revisores: usuarios con rol "jefe" 
export const reportReviewers = [
  { id: 'user-jefe-1', name: 'Dra. Laura Méndez' },
  { id: 'user-jefe-2', name: 'Dr. Carlos Rivas' },
];

// origin: 'automatico' | 'manual'. validation: null si el menú aún no fue revisado.
// result usa los estados oficiales: 'aprobado' | 'rechazado'.
export const generatedMenus = [
  {
    id: 'menu-101', name: 'Menú semanal A', dietId: 'diet-1', origin: 'automatico',
    creatorName: 'Lic. Ana Gómez', createdAt: '2026-09-14T10:30:00Z',
    parameters: { targetCalories: 1500, mealsPerDay: 4, excludedGroups: ['Lácteos'], maxRepeatDays: 2 },
    validation: { reviewerId: 'user-jefe-1', validatedAt: '2026-09-15T14:00:00Z', result: 'aprobado', observations: 'Distribución calórica adecuada.' },
  },
  {
    id: 'menu-102', name: 'Menú semanal B', dietId: 'diet-1', origin: 'automatico',
    creatorName: 'Lic. Ana Gómez', createdAt: '2026-09-20T09:00:00Z',
    parameters: { targetCalories: 1500, mealsPerDay: 5, excludedGroups: [], maxRepeatDays: 3 },
    validation: { reviewerId: 'user-jefe-1', validatedAt: '2026-09-21T16:45:00Z', result: 'rechazado', observations: 'Exceso de azúcares simples en la merienda del jueves.' },
  },
  {
    id: 'menu-103', name: 'Menú semanal C', dietId: 'diet-1', origin: 'automatico',
    creatorName: 'Lic. Pedro Sosa', createdAt: '2026-10-01T08:15:00Z',
    parameters: { targetCalories: 1600, mealsPerDay: 4, excludedGroups: ['Frutos secos'], maxRepeatDays: 2 },
    validation: null, // pendiente de revisión
  },
  {
    id: 'menu-104', name: 'Menú diabético A', dietId: 'diet-2', origin: 'automatico',
    creatorName: 'Lic. Pedro Sosa', createdAt: '2026-09-18T11:20:00Z',
    parameters: { targetCalories: 1800, mealsPerDay: 5, excludedGroups: ['Azúcares'], maxRepeatDays: 2 },
    validation: { reviewerId: 'user-jefe-2', validatedAt: '2026-09-19T10:00:00Z', result: 'aprobado', observations: '' },
  },
  {
    id: 'menu-105', name: 'Menú diabético manual', dietId: 'diet-2', origin: 'manual', // no debe salir en el Reporte 1
    creatorName: 'Lic. Ana Gómez', createdAt: '2026-09-25T13:00:00Z',
    parameters: {},
    validation: { reviewerId: 'user-jefe-2', validatedAt: '2026-09-26T09:30:00Z', result: 'aprobado', observations: 'Menú manual validado sin cambios.' },
  },
  {
    id: 'menu-106', name: 'Menú proteico A', dietId: 'diet-3', origin: 'automatico',
    creatorName: 'Lic. Ana Gómez', createdAt: '2026-10-05T07:45:00Z',
    parameters: { targetCalories: 2200, mealsPerDay: 5, excludedGroups: [], maxRepeatDays: 2 },
    validation: { reviewerId: 'user-jefe-1', validatedAt: '2026-10-06T12:10:00Z', result: 'aprobado', observations: 'Aporte proteico dentro de lo esperado.' },
  },
  {
    id: 'menu-107', name: 'Menú diabético B', dietId: 'diet-2', origin: 'automatico',
    creatorName: 'Lic. Pedro Sosa', createdAt: '2026-10-08T10:00:00Z',
    parameters: { targetCalories: 1800, mealsPerDay: 4, excludedGroups: ['Gluten'], maxRepeatDays: 3 },
    validation: { reviewerId: 'user-jefe-2', validatedAt: '2026-10-09T15:20:00Z', result: 'rechazado', observations: 'Falta variedad en las cenas.' },
  },
];