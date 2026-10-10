
// rol ∈ {paciente, nutricionista, jefe, admin}
export const usuarios = [
  { id_usuario: 1, nombre: "Ana Pérez",           email: "ana@gmail.com",    contrasenna: "1234", rol: "nutricionista", en_linea: false, fecha_creacion: "2026-01-10", especialidad: "Nutrición clínica",   edad: null, sala: null },
  { id_usuario: 2, nombre: "Luis Gonzalez",       email: "luis@gmail.com",   contrasenna: "1234", rol: "nutricionista", en_linea: false, fecha_creacion: "2026-01-11", especialidad: "Nutrición deportiva", edad: null, sala: null },
  { id_usuario: 3, nombre: "Lianet Trujillo",     email: "lianet@gmail.com", contrasenna: "1234", rol: "jefe",          en_linea: false, fecha_creacion: "2026-01-01", especialidad: "Nutrición clínica",   edad: null, sala: null },
  { id_usuario: 4, nombre: "Roberto Sánchez",     email: "roberto@gmail.com", contrasenna: "1234", rol: "admin",        en_linea: false, fecha_creacion: "2026-01-01", especialidad: null,                  edad: null, sala: null },
  { id_usuario: 5, nombre: "Carla Ruiz",          email: "carla@gmail.com",      contrasenna: "1234", rol: "paciente",      en_linea: true,  fecha_creacion: "2026-02-01", especialidad: null,                  edad: 34,   sala: "Sala A" },
  { id_usuario: 6, nombre: "Miguel Torres",       email: "miguel@gmail.com",     contrasenna: "1234", rol: "paciente",      en_linea: false, fecha_creacion: "2026-02-03", especialidad: null,                  edad: 45,   sala: "Sala B" },
  { id_usuario: 7, nombre: "Sofía Díaz",          email: null,                   contrasenna: "1234", rol: "paciente",      en_linea: false, fecha_creacion: "2026-02-05", especialidad: null,                  edad: 28,   sala: "Sala A" },
];

// ==================== R3: DIETA ====================
// estado_dieta ∈ {borrador, guardado}
export const dietas = [
  { id_dieta: 1, nombre_dieta: "Dieta balanceada",            programa: "Control de peso",   fecha_creacion: "2026-02-10", estado_dieta: "guardado" },
  { id_dieta: 2, nombre_dieta: "Dieta baja en carbohidratos", programa: "Diabetes tipo 2",   fecha_creacion: "2026-02-12", estado_dieta: "guardado" },
  { id_dieta: 3, nombre_dieta: "Dieta vegetariana",           programa: "Nutrición general", fecha_creacion: "2026-02-15", estado_dieta: "borrador" },
];

// ==================== R4: GRUPO NUTRICIONAL ====================
// estado_grupo ∈ {borrador, guardado}
export const gruposNutricionales = [
  { id_grupo: 1, nombre_grupo: "Cereales",  descripcion: "Arroz, trigo, maíz y derivados", estado_grupo: "guardado", fecha_creacion_grupo: "2026-01-05" },
  { id_grupo: 2, nombre_grupo: "Proteínas", descripcion: "Carnes, huevos, pescados",       estado_grupo: "guardado", fecha_creacion_grupo: "2026-01-05" },
  { id_grupo: 3, nombre_grupo: "Vegetales", descripcion: "Verduras y hortalizas",          estado_grupo: "guardado", fecha_creacion_grupo: "2026-01-06" },
  { id_grupo: 4, nombre_grupo: "Frutas",    descripcion: "Frutas frescas",                 estado_grupo: "guardado", fecha_creacion_grupo: "2026-01-06" },
  { id_grupo: 5, nombre_grupo: "Lácteos",   descripcion: "Leche y derivados",              estado_grupo: "guardado", fecha_creacion_grupo: "2026-01-07" },
  { id_grupo: 6, nombre_grupo: "Grasas",    descripcion: "Aceites y frutos secos",         estado_grupo: "borrador", fecha_creacion_grupo: "2026-02-20" },
];

// ==================== R6: ALIMENTO ====================
// estado_alimento ∈ {borrador, pendiente, aprobado, rechazado}
// tipo_preparacion ∈ {entrante, plato fuerte, bebida, postre}
// nivel_calorico ∈ {bajo, medio, alto}
export const alimentos = [
  { id_alimento: 1, nombre_alimento: "Arroz blanco",       tipo_preparacion: "plato fuerte", nivel_calorico: "medio", fecha_creacion_alimento: "2026-02-01", estado_alimento: "aprobado",  id_usuario_creador: 1, id_usuario_jefe: 3, fecha_validacion_alimento: "2026-02-02", observaciones_alimento: null,                        resultado_val_alimento: "aprobado" },
  { id_alimento: 2, nombre_alimento: "Pollo a la plancha", tipo_preparacion: "plato fuerte", nivel_calorico: "medio", fecha_creacion_alimento: "2026-02-01", estado_alimento: "aprobado",  id_usuario_creador: 1, id_usuario_jefe: 3, fecha_validacion_alimento: "2026-02-02", observaciones_alimento: null,                        resultado_val_alimento: "aprobado" },
  { id_alimento: 3, nombre_alimento: "Ensalada verde",     tipo_preparacion: "entrante",     nivel_calorico: "bajo",  fecha_creacion_alimento: "2026-02-03", estado_alimento: "aprobado",  id_usuario_creador: 2, id_usuario_jefe: 3, fecha_validacion_alimento: "2026-02-04", observaciones_alimento: null,                        resultado_val_alimento: "aprobado" },
  { id_alimento: 4, nombre_alimento: "Manzana",            tipo_preparacion: "postre",       nivel_calorico: "bajo",  fecha_creacion_alimento: "2026-02-03", estado_alimento: "aprobado",  id_usuario_creador: 1, id_usuario_jefe: 3, fecha_validacion_alimento: "2026-02-04", observaciones_alimento: null,                        resultado_val_alimento: "aprobado" },
  { id_alimento: 5, nombre_alimento: "Yogur natural",      tipo_preparacion: "postre",       nivel_calorico: "bajo",  fecha_creacion_alimento: "2026-02-05", estado_alimento: "aprobado",  id_usuario_creador: 2, id_usuario_jefe: 3, fecha_validacion_alimento: "2026-02-06", observaciones_alimento: null,                        resultado_val_alimento: "aprobado" },
  { id_alimento: 6, nombre_alimento: "Aguacate",           tipo_preparacion: "entrante",     nivel_calorico: "alto",  fecha_creacion_alimento: "2026-02-05", estado_alimento: "aprobado",  id_usuario_creador: 1, id_usuario_jefe: 3, fecha_validacion_alimento: "2026-02-06", observaciones_alimento: null,                        resultado_val_alimento: "aprobado" },
  { id_alimento: 7, nombre_alimento: "Pasta integral",     tipo_preparacion: "plato fuerte", nivel_calorico: "medio", fecha_creacion_alimento: "2026-02-07", estado_alimento: "pendiente", id_usuario_creador: 2, id_usuario_jefe: null, fecha_validacion_alimento: null,     observaciones_alimento: null,                        resultado_val_alimento: null },
  { id_alimento: 8, nombre_alimento: "Salmón",             tipo_preparacion: "plato fuerte", nivel_calorico: "medio", fecha_creacion_alimento: "2026-02-08", estado_alimento: "aprobado",  id_usuario_creador: 1, id_usuario_jefe: 3, fecha_validacion_alimento: "2026-02-09", observaciones_alimento: null,                        resultado_val_alimento: "aprobado" },
  { id_alimento: 9, nombre_alimento: "Brócoli",            tipo_preparacion: "entrante",     nivel_calorico: "bajo",  fecha_creacion_alimento: "2026-02-08", estado_alimento: "aprobado",  id_usuario_creador: 2, id_usuario_jefe: 3, fecha_validacion_alimento: "2026-02-09", observaciones_alimento: null,                        resultado_val_alimento: "aprobado" },
  { id_alimento: 10, nombre_alimento: "Jugo de naranja",   tipo_preparacion: "bebida",       nivel_calorico: "bajo",  fecha_creacion_alimento: "2026-02-10", estado_alimento: "aprobado",  id_usuario_creador: 1, id_usuario_jefe: 3, fecha_validacion_alimento: "2026-02-11", observaciones_alimento: null,                        resultado_val_alimento: "aprobado" },
  { id_alimento: 11, nombre_alimento: "Queso fresco",      tipo_preparacion: "entrante",     nivel_calorico: "medio", fecha_creacion_alimento: "2026-02-10", estado_alimento: "rechazado", id_usuario_creador: 2, id_usuario_jefe: 3, fecha_validacion_alimento: "2026-02-12", observaciones_alimento: "Falta detalle nutricional", resultado_val_alimento: "rechazado" },
  { id_alimento: 12, nombre_alimento: "Almendras",         tipo_preparacion: "postre",       nivel_calorico: "alto",  fecha_creacion_alimento: "2026-02-11", estado_alimento: "aprobado",  id_usuario_creador: 1, id_usuario_jefe: 3, fecha_validacion_alimento: "2026-02-12", observaciones_alimento: null,                        resultado_val_alimento: "aprobado" },
];

// ==================== R7: FICHA NUTRICIONAL ====================
// contenido es JSON (en mock se guarda como string)
export const fichasNutricionales = [
  { id_ficha: 1,  id_alimento: 1,  contenido: '{"calorias_totales":195,"macronutrientes":{"carbos":45,"proteinas":4,"grasas":0.5},"alergenos":[]}' },
  { id_ficha: 2,  id_alimento: 2,  contenido: '{"calorias_totales":330,"macronutrientes":{"carbos":0,"proteinas":62,"grasas":7},"alergenos":[]}' },
  { id_ficha: 3,  id_alimento: 3,  contenido: '{"calorias_totales":45,"macronutrientes":{"carbos":8,"proteinas":2,"grasas":0.3},"alergenos":[]}' },
  { id_ficha: 4,  id_alimento: 4,  contenido: '{"calorias_totales":95,"macronutrientes":{"carbos":25,"proteinas":0.5,"grasas":0.3},"alergenos":[]}' },
  { id_ficha: 5,  id_alimento: 5,  contenido: '{"calorias_totales":120,"macronutrientes":{"carbos":12,"proteinas":8,"grasas":4},"alergenos":["lactosa"]}' },
  { id_ficha: 6,  id_alimento: 6,  contenido: '{"calorias_totales":240,"macronutrientes":{"carbos":12,"proteinas":3,"grasas":22},"alergenos":[]}' },
  { id_ficha: 7,  id_alimento: 7,  contenido: '{"calorias_totales":220,"macronutrientes":{"carbos":43,"proteinas":8,"grasas":1.5},"alergenos":["gluten"]}' },
  { id_ficha: 8,  id_alimento: 8,  contenido: '{"calorias_totales":280,"macronutrientes":{"carbos":0,"proteinas":40,"grasas":13},"alergenos":["pescado"]}' },
  { id_ficha: 9,  id_alimento: 9,  contenido: '{"calorias_totales":34,"macronutrientes":{"carbos":7,"proteinas":3,"grasas":0.4},"alergenos":[]}' },
  { id_ficha: 10, id_alimento: 10, contenido: '{"calorias_totales":110,"macronutrientes":{"carbos":26,"proteinas":2,"grasas":0.2},"alergenos":[]}' },
  { id_ficha: 11, id_alimento: 11, contenido: '{"calorias_totales":180,"macronutrientes":{"carbos":2,"proteinas":14,"grasas":13},"alergenos":["lactosa"]}' },
  { id_ficha: 12, id_alimento: 12, contenido: '{"calorias_totales":170,"macronutrientes":{"carbos":6,"proteinas":6,"grasas":15},"alergenos":["frutos secos"]}' },
];

// ==================== R5: MENÚ ====================
// estado_menu ∈ {borrador, pendiente, aprobado, rechazado}
export const menus = [
  { id_menu: 1, nombre_menu: "Menú desayuno saludable", proporcion_preparacion: "1 entrante, 1 plato fuerte, 1 bebida", fecha_creacion_menu: "2026-03-01", estado_menu: "aprobado",  id_dieta: 1, id_usuario_creador: 1, id_usuario_jefe: 3, fecha_validacion_menu: "2026-03-02", observaciones_menu: null,                    resultado_val_menu: "aprobado" },
  { id_menu: 2, nombre_menu: "Menú almuerzo completo",  proporcion_preparacion: "1 entrante, 1 plato fuerte, 1 postre", fecha_creacion_menu: "2026-03-03", estado_menu: "aprobado",  id_dieta: 1, id_usuario_creador: 1, id_usuario_jefe: 3, fecha_validacion_menu: "2026-03-04", observaciones_menu: null,                    resultado_val_menu: "aprobado" },
  { id_menu: 3, nombre_menu: "Menú cena ligera",        proporcion_preparacion: "1 entrante, 1 plato fuerte",           fecha_creacion_menu: "2026-03-05", estado_menu: "aprobado",  id_dieta: 2, id_usuario_creador: 2, id_usuario_jefe: 3, fecha_validacion_menu: "2026-03-06", observaciones_menu: null,                    resultado_val_menu: "aprobado" },
  { id_menu: 4, nombre_menu: "Menú snack tarde",        proporcion_preparacion: "1 postre, 1 bebida",                   fecha_creacion_menu: "2026-03-07", estado_menu: "rechazado", id_dieta: 2, id_usuario_creador: 2, id_usuario_jefe: 3, fecha_validacion_menu: "2026-03-08", observaciones_menu: "Excede nivel calórico", resultado_val_menu: "rechazado" },
  { id_menu: 5, nombre_menu: "Menú vegetariano",        proporcion_preparacion: "1 entrante, 1 plato fuerte",           fecha_creacion_menu: "2026-03-09", estado_menu: "pendiente", id_dieta: 3, id_usuario_creador: 1, id_usuario_jefe: null, fecha_validacion_menu: null,     observaciones_menu: null,                    resultado_val_menu: null },
];

// ==================== R8: VALORACIÓN NUTRICIONAL ====================
// tipo_val ∈ {ordinaria, revalorización}
export const valoraciones = [
  { id_valoracion: 1, id_usuario_nutri: 1, id_usuario_paciente: 5, fecha_valoracion: "2026-03-10", puntuacion: 85, observaciones_val: "Buena evolución",  tipo_val: "ordinaria",      id_dieta: 1 },
  { id_valoracion: 2, id_usuario_nutri: 2, id_usuario_paciente: 6, fecha_valoracion: "2026-03-11", puntuacion: 60, observaciones_val: "Requiere ajustes", tipo_val: "ordinaria",      id_dieta: 2 },
  { id_valoracion: 3, id_usuario_nutri: 1, id_usuario_paciente: 5, fecha_valoracion: "2026-03-12", puntuacion: 90, observaciones_val: "Mejora notable",   tipo_val: "revalorización", id_dieta: 1 },
  { id_valoracion: 4, id_usuario_nutri: 2, id_usuario_paciente: 7, fecha_valoracion: "2026-03-13", puntuacion: 75, observaciones_val: null,               tipo_val: "ordinaria",      id_dieta: 3 },
];

// ==================== R9: MENÚ ASIGNADO ====================
export const menusAsignados = [
  { id_menu_asignado: 1, id_usuario_nutri: 1, id_usuario_paciente: 5, id_menu: 1, fecha_asignacion: "2026-03-10" },
  { id_menu_asignado: 2, id_usuario_nutri: 1, id_usuario_paciente: 5, id_menu: 2, fecha_asignacion: "2026-03-11" },
  { id_menu_asignado: 3, id_usuario_nutri: 2, id_usuario_paciente: 6, id_menu: 3, fecha_asignacion: "2026-03-11" },
  { id_menu_asignado: 4, id_usuario_nutri: 1, id_usuario_paciente: 7, id_menu: 1, fecha_asignacion: "2026-03-12" },
];

// ==================== R10: RESTRICCIÓN GRUPO–ALIMENTO ====================
export const restriccionesGrupoAlimento = [
  { id_grupo: 1, id_alimento: 1,  cantidad_minima: 50,  cantidad_maxima: 200 },
  { id_grupo: 1, id_alimento: 7,  cantidad_minima: 50,  cantidad_maxima: 150 },
  { id_grupo: 2, id_alimento: 2,  cantidad_minima: 100, cantidad_maxima: 250 },
  { id_grupo: 2, id_alimento: 8,  cantidad_minima: 100, cantidad_maxima: 200 },
  { id_grupo: 3, id_alimento: 3,  cantidad_minima: 80,  cantidad_maxima: 200 },
  { id_grupo: 3, id_alimento: 9,  cantidad_minima: 80,  cantidad_maxima: 200 },
  { id_grupo: 4, id_alimento: 4,  cantidad_minima: 1,   cantidad_maxima: 3   },
  { id_grupo: 5, id_alimento: 5,  cantidad_minima: 1,   cantidad_maxima: 2   },
  { id_grupo: 6, id_alimento: 6,  cantidad_minima: 30,  cantidad_maxima: 100 },
  { id_grupo: 6, id_alimento: 12, cantidad_minima: 10,  cantidad_maxima: 40  },
];

// ==================== R11: COBERTURA DIETA–GRUPO ====================
export const coberturaDietaGrupo = [
  { id_dieta: 1, id_grupo: 1 }, { id_dieta: 1, id_grupo: 2 }, { id_dieta: 1, id_grupo: 3 }, { id_dieta: 1, id_grupo: 4 },
  { id_dieta: 2, id_grupo: 2 }, { id_dieta: 2, id_grupo: 3 },
  { id_dieta: 3, id_grupo: 1 }, { id_dieta: 3, id_grupo: 3 }, { id_dieta: 3, id_grupo: 4 },
];

// ==================== R12: CONTENIDO MENÚ–ALIMENTO ====================
export const contenidoMenuAlimento = [
  { id_menu: 1, id_alimento: 4 },  { id_menu: 1, id_alimento: 5 },  { id_menu: 1, id_alimento: 10 },
  { id_menu: 2, id_alimento: 1 },  { id_menu: 2, id_alimento: 2 },  { id_menu: 2, id_alimento: 3 },  { id_menu: 2, id_alimento: 6 },
  { id_menu: 3, id_alimento: 8 },  { id_menu: 3, id_alimento: 9 },
  { id_menu: 4, id_alimento: 12 }, { id_menu: 4, id_alimento: 10 },
  { id_menu: 5, id_alimento: 1 },  { id_menu: 5, id_alimento: 3 },  { id_menu: 5, id_alimento: 9 },
];

// ==================== R13: RECETA PLATO COMPUESTO ====================
export const recetasPlatosCompuestos = [
  { id_alimento_compuesto: 2, id_alimento_simple: 1 }, // Pollo con arroz
  { id_alimento_compuesto: 2, id_alimento_simple: 9 }, // Pollo con brócoli
  { id_alimento_compuesto: 8, id_alimento_simple: 3 }, // Salmón con ensalada
];

// ==================== R14: CONSUMO PACIENTE–ALIMENTO ====================
export const consumos = [
  { id_consumo: 1, id_usuario_paciente: 5, id_alimento: 4,  id_fecha_hora: "2026-03-10T08:15:00", cantidad: 1,   unidad: "unidad" },
  { id_consumo: 2, id_usuario_paciente: 5, id_alimento: 10, id_fecha_hora: "2026-03-10T08:20:00", cantidad: 200, unidad: "ml" },
  { id_consumo: 3, id_usuario_paciente: 5, id_alimento: 1,  id_fecha_hora: "2026-03-10T13:00:00", cantidad: 150, unidad: "g" },
  { id_consumo: 4, id_usuario_paciente: 6, id_alimento: 2,  id_fecha_hora: "2026-03-11T13:30:00", cantidad: 200, unidad: "g" },
  { id_consumo: 5, id_usuario_paciente: 7, id_alimento: 9,  id_fecha_hora: "2026-03-12T19:00:00", cantidad: 100, unidad: "g" },
  { id_consumo: 6, id_usuario_paciente: 7, id_alimento: 5,  id_fecha_hora: "2026-03-12T19:15:00", cantidad: 1,   unidad: "unidad" },
];

// ==================== R2: SOLICITUD (aplanada) ====================
// estado ∈ {pendiente, atendida}
// tipo_solicitud ∈ {usuario, revalorizacion, nutricionista}
export const solicitudes = [
  { id_solicitud: 1, estado: "pendiente", fecha_solicitud: "2026-03-05", remitente: 2, destinatario: 4, descripcion: "Solicito creación de cuenta para nuevo paciente",    nombre_solicitante: "Luis Gómez",    sala_solicitante: null,    edad_solicitante: null, tipo_solicitud: "usuario" },
  { id_solicitud: 2, estado: "pendiente", fecha_solicitud: "2026-03-06", remitente: 5, destinatario: 1, descripcion: "Solicito revalorización nutricional con la Dra. Ana", nombre_solicitante: "Carla Ruiz",    sala_solicitante: "Sala A", edad_solicitante: 34,   tipo_solicitud: "revalorizacion" },
  { id_solicitud: 3, estado: "atendida",  fecha_solicitud: "2026-03-07", remitente: 2, destinatario: 1, descripcion: "Solicito revisión del menú 'Snack tarde'",            nombre_solicitante: "Luis Gómez",    sala_solicitante: null,    edad_solicitante: null, tipo_solicitud: "nutricionista" },
  { id_solicitud: 4, estado: "pendiente", fecha_solicitud: "2026-03-08", remitente: 6, destinatario: 2, descripcion: "Solicito revalorización por cambio de dieta",         nombre_solicitante: "Miguel Torres", sala_solicitante: "Sala B", edad_solicitante: 45,   tipo_solicitud: "revalorizacion" },
];

// ==================== Export agrupado ====================
export const mockData = {
  usuarios,
  solicitudes,
  dietas,
  gruposNutricionales,
  menus,
  alimentos,
  fichasNutricionales,
  valoraciones,
  menusAsignados,
  restriccionesGrupoAlimento,
  coberturaDietaGrupo,
  contenidoMenuAlimento,
  recetasPlatosCompuestos,
  consumos,
};