
/*
 * Datos simulados del sistema de gestión para la generación
 * automática de menús nutricionales.
 *
 * Las entidades se mantienen separadas para representar las
 * relaciones de la base de datos.
 */

// ============================================================
// R1. USUARIOS
// ============================================================

export const usuarios = [
  {
    id_usuario: 1,
    nombre: "Ana",
    apellidos: "Pérez",
    correo: "ana.perez@medicare.com",
    contrasena: "ana123",
    rol: "nutricionista",
    especialidad: "Nutrición clínica",
    estado_usuario: "activo",
  },
  {
    id_usuario: 2,
    nombre: "Luis",
    apellidos: "González",
    correo: "luis.gonzalez@medicare.com",
    contrasena: "luis123",
    rol: "nutricionista",
    especialidad: "Nutrición deportiva",
    estado_usuario: "activo",
  },
  {
    id_usuario: 3,
    nombre: "Lianet",
    apellidos: "Trujillo",
    correo: "lianet.trujillo@medicare.com",
    contrasena: "jefe123",
    rol: "jefe",
    especialidad: "Jefatura de nutrición",
    estado_usuario: "activo",
  },
  {
    id_usuario: 4,
    nombre: "Roberto",
    apellidos: "Sánchez",
    correo: "roberto.sanchez@medicare.com",
    contrasena: "admin123",
    rol: "admin",
    especialidad: null,
    estado_usuario: "activo",
  },
  {
    id_usuario: 5,
    nombre: "Carla",
    apellidos: "Ruiz",
    correo: "carla.ruiz@medicare.com",
    contrasena: "carla123",
    rol: "paciente",
    especialidad: null,
    estado_usuario: "activo",
  },
  {
    id_usuario: 6,
    nombre: "Miguel",
    apellidos: "Torres",
    correo: "miguel.torres@medicare.com",
    contrasena: "miguel123",
    rol: "paciente",
    especialidad: null,
    estado_usuario: "activo",
  },
  {
    id_usuario: 7,
    nombre: "Sofía",
    apellidos: "Díaz",
    correo: "sofia.diaz@medicare.com",
    contrasena: "sofia123",
    rol: "paciente",
    especialidad: null,
    estado_usuario: "activo",
  },
];

// ============================================================
// R2. SOLICITUDES
// ============================================================

export const solicitudes = [
  {
    id_solicitud: 1,
    id_usuario: 5,
    tipo_solicitud: "revaloracion",
    descripcion: "Solicito una revisión de mi dieta.",
    estado_solicitud: "pendiente",
    fecha_solicitud: "2026-10-08",
    observaciones: null,
  },
  {
    id_solicitud: 2,
    id_usuario: 6,
    tipo_solicitud: "cambio_dieta",
    descripcion: "Solicito revisar mi programa nutricional.",
    estado_solicitud: "aprobada",
    fecha_solicitud: "2026-10-09",
    observaciones: "Solicitud aceptada para revisión.",
  },
  {
    id_solicitud: 3,
    id_usuario: 7,
    tipo_solicitud: "revaloracion",
    descripcion: "Necesito actualizar mi valoración nutricional.",
    estado_solicitud: "pendiente",
    fecha_solicitud: "2026-10-11",
    observaciones: null,
  },
];

// ============================================================
// R3. DIETAS
// ============================================================

export const dietas = [
  {
    id_dieta: 1,
    nombre_dieta: "Balanceada",
    programa: "Control de peso",
    fecha_creacion: "2026-09-20",
    estado_dieta: "guardado",
    calorias_minimas: 1800,
    calorias_maximas: 2000,
  },
  {
    id_dieta: 2,
    nombre_dieta: "Baja en carbohidratos",
    programa: "Diabetes tipo 2",
    fecha_creacion: "2026-09-25",
    estado_dieta: "guardado",
    calorias_minimas: 1600,
    calorias_maximas: 1800,
  },
  {
    id_dieta: 3,
    nombre_dieta: "Vegetariana",
    programa: "Nutrición general",
    fecha_creacion: "2026-10-01",
    estado_dieta: "borrador",
    calorias_minimas: 1800,
    calorias_maximas: 2200,
  },
];

// ============================================================
// R4. NUTRICIONISTAS QUE ATIENDEN DIETAS
// ============================================================

export const atiende = [
  { id_usuario: 1, id_dieta: 1 },
  { id_usuario: 1, id_dieta: 2 },
  { id_usuario: 2, id_dieta: 2 },
];

// ============================================================
// R5. GRUPOS NUTRICIONALES
// ============================================================

export const gruposNutricionales = [
  {
    id_grupo_nutricional: 1,
    nombre_grupo: "Cereales",
    descripcion: "Cereales y alimentos derivados.",
    estado_grupo: "guardado",
  },
  {
    id_grupo_nutricional: 2,
    nombre_grupo: "Proteínas",
    descripcion: "Alimentos que aportan proteínas.",
    estado_grupo: "guardado",
  },
  {
    id_grupo_nutricional: 3,
    nombre_grupo: "Vegetales",
    descripcion: "Verduras y hortalizas.",
    estado_grupo: "guardado",
  },
  {
    id_grupo_nutricional: 4,
    nombre_grupo: "Frutas",
    descripcion: "Frutas y alimentos derivados.",
    estado_grupo: "guardado",
  },
  {
    id_grupo_nutricional: 5,
    nombre_grupo: "Lácteos",
    descripcion: "Leche y productos lácteos.",
    estado_grupo: "guardado",
  },
  {
    id_grupo_nutricional: 6,
    nombre_grupo: "Grasas",
    descripcion: "Alimentos ricos en grasas.",
    estado_grupo: "borrador",
  },
];

// ============================================================
// R6. ALIMENTOS
// ============================================================

export const alimentos = [
  {
    id_alimento: 1,
    nombre_alimento: "Arroz blanco",
    tipo_preparacion: "plato fuerte",
    nivel_calorico: "medio",
    tipo_alimento: "simple",
    fecha_creacion: "2026-09-20",
    estado_alimento: "aprobado",
    id_usuario_creador: 1,
    fecha_validacion: "2026-09-21",
    observaciones: null,
  },
  {
    id_alimento: 2,
    nombre_alimento: "Pollo a la plancha",
    tipo_preparacion: "plato fuerte",
    nivel_calorico: "medio",
    tipo_alimento: "simple",
    fecha_creacion: "2026-09-20",
    estado_alimento: "aprobado",
    id_usuario_creador: 1,
    fecha_validacion: "2026-09-21",
    observaciones: null,
  },
  {
    id_alimento: 3,
    nombre_alimento: "Ensalada verde",
    tipo_preparacion: "entrante",
    nivel_calorico: "bajo",
    tipo_alimento: "compuesto",
    fecha_creacion: "2026-09-21",
    estado_alimento: "aprobado",
    id_usuario_creador: 1,
    fecha_validacion: "2026-09-22",
    observaciones: null,
  },
  {
    id_alimento: 4,
    nombre_alimento: "Manzana",
    tipo_preparacion: "postre",
    nivel_calorico: "bajo",
    tipo_alimento: "simple",
    fecha_creacion: "2026-09-22",
    estado_alimento: "aprobado",
    id_usuario_creador: 1,
    fecha_validacion: "2026-09-23",
    observaciones: null,
  },
  {
    id_alimento: 5,
    nombre_alimento: "Yogur natural",
    tipo_preparacion: "postre",
    nivel_calorico: "medio",
    tipo_alimento: "simple",
    fecha_creacion: "2026-09-22",
    estado_alimento: "aprobado",
    id_usuario_creador: 2,
    fecha_validacion: "2026-09-23",
    observaciones: null,
  },
  {
    id_alimento: 6,
    nombre_alimento: "Aguacate",
    tipo_preparacion: "entrante",
    nivel_calorico: "alto",
    tipo_alimento: "simple",
    fecha_creacion: "2026-09-23",
    estado_alimento: "aprobado",
    id_usuario_creador: 1,
    fecha_validacion: "2026-09-24",
    observaciones: null,
  },
  {
    id_alimento: 7,
    nombre_alimento: "Pasta integral",
    tipo_preparacion: "plato fuerte",
    nivel_calorico: "medio",
    tipo_alimento: "simple",
    fecha_creacion: "2026-09-25",
    estado_alimento: "pendiente",
    id_usuario_creador: 2,
    fecha_validacion: null,
    observaciones: null,
  },
  {
    id_alimento: 8,
    nombre_alimento: "Salmón",
    tipo_preparacion: "plato fuerte",
    nivel_calorico: "alto",
    tipo_alimento: "simple",
    fecha_creacion: "2026-09-26",
    estado_alimento: "aprobado",
    id_usuario_creador: 2,
    fecha_validacion: "2026-09-27",
    observaciones: null,
  },
  {
    id_alimento: 9,
    nombre_alimento: "Brócoli",
    tipo_preparacion: "entrante",
    nivel_calorico: "bajo",
    tipo_alimento: "simple",
    fecha_creacion: "2026-09-26",
    estado_alimento: "aprobado",
    id_usuario_creador: 1,
    fecha_validacion: "2026-09-27",
    observaciones: null,
  },
  {
    id_alimento: 10,
    nombre_alimento: "Jugo de naranja",
    tipo_preparacion: "bebida",
    nivel_calorico: "medio",
    tipo_alimento: "simple",
    fecha_creacion: "2026-09-27",
    estado_alimento: "aprobado",
    id_usuario_creador: 2,
    fecha_validacion: "2026-09-28",
    observaciones: null,
  },
  {
    id_alimento: 11,
    nombre_alimento: "Queso fresco",
    tipo_preparacion: "entrante",
    nivel_calorico: "medio",
    tipo_alimento: "simple",
    fecha_creacion: "2026-09-28",
    estado_alimento: "rechazado",
    id_usuario_creador: 2,
    fecha_validacion: "2026-09-29",
    observaciones: "Debe completarse la información nutricional.",
  },
  {
    id_alimento: 12,
    nombre_alimento: "Almendras",
    tipo_preparacion: "postre",
    nivel_calorico: "alto",
    tipo_alimento: "simple",
    fecha_creacion: "2026-09-29",
    estado_alimento: "aprobado",
    id_usuario_creador: 1,
    fecha_validacion: "2026-09-30",
    observaciones: null,
  },
];

// ============================================================
// R7. FICHAS NUTRICIONALES
// ============================================================

export const fichasNutricionales = [
  {
    id_ficha: 1,
    id_alimento: 1,
    informacion_nutricional: JSON.stringify({
      descripcion: "Arroz blanco cocido",
      porcion: 100,
      unidad: "g",
      calorias: 130,
      proteinas: 2.7,
      carbohidratos: 28,
      grasas: 0.3,
      alergenos: [],
    }),
    calorias: 130,
    proteinas: 2.7,
    carbohidratos: 28,
    grasas: 0.3,
    alergenos: [],
  },
  {
    id_ficha: 2,
    id_alimento: 2,
    informacion_nutricional: JSON.stringify({
      descripcion: "Pollo a la plancha",
      porcion: 100,
      unidad: "g",
      calorias: 165,
      proteinas: 31,
      carbohidratos: 0,
      grasas: 3.6,
      alergenos: [],
    }),
    calorias: 165,
    proteinas: 31,
    carbohidratos: 0,
    grasas: 3.6,
    alergenos: [],
  },
  {
    id_ficha: 3,
    id_alimento: 3,
    informacion_nutricional: JSON.stringify({
      descripcion: "Ensalada verde",
      porcion: 100,
      unidad: "g",
      calorias: 25,
      proteinas: 1.5,
      carbohidratos: 4,
      grasas: 0.3,
      alergenos: [],
    }),
    calorias: 25,
    proteinas: 1.5,
    carbohidratos: 4,
    grasas: 0.3,
    alergenos: [],
  },
  {
    id_ficha: 4,
    id_alimento: 4,
    informacion_nutricional: JSON.stringify({
      descripcion: "Manzana",
      porcion: 100,
      unidad: "g",
      calorias: 52,
      proteinas: 0.3,
      carbohidratos: 14,
      grasas: 0.2,
      alergenos: [],
    }),
    calorias: 52,
    proteinas: 0.3,
    carbohidratos: 14,
    grasas: 0.2,
    alergenos: [],
  },
  {
    id_ficha: 5,
    id_alimento: 5,
    informacion_nutricional: JSON.stringify({
      descripcion: "Yogur natural",
      porcion: 100,
      unidad: "g",
      calorias: 61,
      proteinas: 3.5,
      carbohidratos: 4.7,
      grasas: 3.3,
      alergenos: ["leche"],
    }),
    calorias: 61,
    proteinas: 3.5,
    carbohidratos: 4.7,
    grasas: 3.3,
    alergenos: ["leche"],
  },
  {
    id_ficha: 6,
    id_alimento: 6,
    informacion_nutricional: JSON.stringify({
      descripcion: "Aguacate",
      porcion: 100,
      unidad: "g",
      calorias: 160,
      proteinas: 2,
      carbohidratos: 8.5,
      grasas: 14.7,
      alergenos: [],
    }),
    calorias: 160,
    proteinas: 2,
    carbohidratos: 8.5,
    grasas: 14.7,
    alergenos: [],
  },
  {
    id_ficha: 7,
    id_alimento: 7,
    informacion_nutricional: JSON.stringify({
      descripcion: "Pasta integral cocida",
      porcion: 100,
      unidad: "g",
      calorias: 149,
      proteinas: 5.5,
      carbohidratos: 30,
      grasas: 1.5,
      alergenos: ["gluten"],
    }),
    calorias: 149,
    proteinas: 5.5,
    carbohidratos: 30,
    grasas: 1.5,
    alergenos: ["gluten"],
  },
  {
    id_ficha: 8,
    id_alimento: 8,
    informacion_nutricional: JSON.stringify({
      descripcion: "Salmón",
      porcion: 100,
      unidad: "g",
      calorias: 208,
      proteinas: 20,
      carbohidratos: 0,
      grasas: 13,
      alergenos: ["pescado"],
    }),
    calorias: 208,
    proteinas: 20,
    carbohidratos: 0,
    grasas: 13,
    alergenos: ["pescado"],
  },
  {
    id_ficha: 9,
    id_alimento: 9,
    informacion_nutricional: JSON.stringify({
      descripcion: "Brócoli",
      porcion: 100,
      unidad: "g",
      calorias: 34,
      proteinas: 2.8,
      carbohidratos: 6.6,
      grasas: 0.4,
      alergenos: [],
    }),
    calorias: 34,
    proteinas: 2.8,
    carbohidratos: 6.6,
    grasas: 0.4,
    alergenos: [],
  },
  {
    id_ficha: 10,
    id_alimento: 10,
    informacion_nutricional: JSON.stringify({
      descripcion: "Jugo de naranja",
      porcion: 100,
      unidad: "ml",
      calorias: 45,
      proteinas: 0.7,
      carbohidratos: 10.4,
      grasas: 0.2,
      alergenos: [],
    }),
    calorias: 45,
    proteinas: 0.7,
    carbohidratos: 10.4,
    grasas: 0.2,
    alergenos: [],
  },
  {
    id_ficha: 11,
    id_alimento: 11,
    informacion_nutricional: JSON.stringify({
      descripcion: "Queso fresco",
      porcion: 100,
      unidad: "g",
      calorias: 250,
      proteinas: 18,
      carbohidratos: 3,
      grasas: 19,
      alergenos: ["leche"],
    }),
    calorias: 250,
    proteinas: 18,
    carbohidratos: 3,
    grasas: 19,
    alergenos: ["leche"],
  },
  {
    id_ficha: 12,
    id_alimento: 12,
    informacion_nutricional: JSON.stringify({
      descripcion: "Almendras",
      porcion: 100,
      unidad: "g",
      calorias: 579,
      proteinas: 21,
      carbohidratos: 22,
      grasas: 50,
      alergenos: ["frutos secos"],
    }),
    calorias: 579,
    proteinas: 21,
    carbohidratos: 22,
    grasas: 50,
    alergenos: ["frutos secos"],
  },
];

// ============================================================
// R8. MENÚS
// ============================================================

export const menus = [
  {
    id_menu: 1,
    nombre_menu: "Desayuno balanceado",
    tipo_comida: "desayuno",
    id_dieta: 1,
    id_usuario_creador: 1,
    fecha_creacion: "2026-10-01",
    estado_menu: "aprobado",
    fecha_validacion: "2026-10-02",
    observaciones: null,
    proporcion_preparacion: "Preparación según las cantidades indicadas.",
  },
  {
    id_menu: 2,
    nombre_menu: "Almuerzo balanceado",
    tipo_comida: "almuerzo",
    id_dieta: 1,
    id_usuario_creador: 1,
    fecha_creacion: "2026-10-02",
    estado_menu: "aprobado",
    fecha_validacion: "2026-10-03",
    observaciones: null,
    proporcion_preparacion: "Cocinar el pollo a la plancha y servir con arroz y vegetales.",
  },
  {
    id_menu: 3,
    nombre_menu: "Cena baja en carbohidratos",
    tipo_comida: "cena",
    id_dieta: 2,
    id_usuario_creador: 2,
    fecha_creacion: "2026-10-03",
    estado_menu: "aprobado",
    fecha_validacion: "2026-10-04",
    observaciones: null,
    proporcion_preparacion: "Preparar el salmón y acompañar con vegetales.",
  },
  {
    id_menu: 4,
    nombre_menu: "Merienda baja en carbohidratos",
    tipo_comida: "merienda",
    id_dieta: 2,
    id_usuario_creador: 2,
    fecha_creacion: "2026-10-04",
    estado_menu: "rechazado",
    fecha_validacion: "2026-10-05",
    observaciones: "Excede el nivel calórico previsto para la propuesta.",
    proporcion_preparacion: "Servir los alimentos en las porciones indicadas.",
  },
  {
    id_menu: 5,
    nombre_menu: "Almuerzo vegetariano",
    tipo_comida: "almuerzo",
    id_dieta: 3,
    id_usuario_creador: 1,
    fecha_creacion: "2026-10-05",
    estado_menu: "pendiente",
    fecha_validacion: null,
    observaciones: null,
    proporcion_preparacion: "Preparar los alimentos según las cantidades propuestas.",
  },
];

// ============================================================
// R9. VALORACIONES NUTRICIONALES
// ============================================================

export const valoraciones = [
  {
    id_valoracion: 1,
    id_usuario: 5,
    id_usuario_nutricionista: 1,
    fecha_valoracion: "2026-09-25",
    peso: 68,
    altura: 1.65,
    observaciones: "Valoración inicial.",
  },
  {
    id_valoracion: 2,
    id_usuario: 6,
    id_usuario_nutricionista: 2,
    fecha_valoracion: "2026-09-26",
    peso: 80,
    altura: 1.75,
    observaciones: "Seguimiento nutricional.",
  },
  {
    id_valoracion: 3,
    id_usuario: 7,
    id_usuario_nutricionista: 1,
    fecha_valoracion: "2026-09-27",
    peso: 58,
    altura: 1.62,
    observaciones: "Valoración inicial.",
  },
  {
    id_valoracion: 4,
    id_usuario: 5,
    id_usuario_nutricionista: 1,
    fecha_valoracion: "2026-10-10",
    peso: 67.5,
    altura: 1.65,
    observaciones: "Valoración de seguimiento.",
  },
];

// ============================================================
// R10. MENÚS ASIGNADOS A PACIENTES
// ============================================================

export const menusAsignados = [
  {
    id_asignacion: 1,
    id_menu: 1,
    id_usuario: 5,
    fecha_asignacion: "2026-10-03",
    estado_asignacion: "activo",
  },
  {
    id_asignacion: 2,
    id_menu: 2,
    id_usuario: 5,
    fecha_asignacion: "2026-10-03",
    estado_asignacion: "activo",
  },
  {
    id_asignacion: 3,
    id_menu: 3,
    id_usuario: 6,
    fecha_asignacion: "2026-10-04",
    estado_asignacion: "activo",
  },
  {
    id_asignacion: 4,
    id_menu: 1,
    id_usuario: 7,
    fecha_asignacion: "2026-10-06",
    estado_asignacion: "activo",
  },
];

// ============================================================
// R11. RESTRICCIONES POR DIETA Y ALIMENTO
//
// IMPORTANTE:
// Las cantidades permitidas pertenecen a la combinación
// dieta-alimento, no al grupo nutricional.
//
// El mismo alimento puede tener cantidades distintas
// en dietas diferentes.
// ============================================================

export const restriccionesDietaAlimento = [
  // Dieta 1: Control de peso
  {
    id_dieta: 1,
    id_alimento: 1,
    cantidad_minima: 50,
    cantidad_maxima: 150,
    unidad_medida: "g",
  },
  {
    id_dieta: 1,
    id_alimento: 2,
    cantidad_minima: 100,
    cantidad_maxima: 200,
    unidad_medida: "g",
  },
  {
    id_dieta: 1,
    id_alimento: 3,
    cantidad_minima: 80,
    cantidad_maxima: 200,
    unidad_medida: "g",
  },
  {
    id_dieta: 1,
    id_alimento: 4,
    cantidad_minima: 1,
    cantidad_maxima: 2,
    unidad_medida: "unidades",
  },
  {
    id_dieta: 1,
    id_alimento: 6,
    cantidad_minima: 30,
    cantidad_maxima: 60,
    unidad_medida: "g",
  },
  {
    id_dieta: 1,
    id_alimento: 10,
    cantidad_minima: 100,
    cantidad_maxima: 200,
    unidad_medida: "ml",
  },

  // Dieta 2: Diabetes tipo 2
  {
    id_dieta: 2,
    id_alimento: 1,
    cantidad_minima: 50,
    cantidad_maxima: 100,
    unidad_medida: "g",
  },
  {
    id_dieta: 2,
    id_alimento: 2,
    cantidad_minima: 100,
    cantidad_maxima: 200,
    unidad_medida: "g",
  },
  {
    id_dieta: 2,
    id_alimento: 8,
    cantidad_minima: 100,
    cantidad_maxima: 180,
    unidad_medida: "g",
  },
  {
    id_dieta: 2,
    id_alimento: 9,
    cantidad_minima: 80,
    cantidad_maxima: 200,
    unidad_medida: "g",
  },
  {
    id_dieta: 2,
    id_alimento: 10,
    cantidad_minima: 0,
    cantidad_maxima: 100,
    unidad_medida: "ml",
  },

  // Dieta 3: Nutrición general vegetariana
  {
    id_dieta: 3,
    id_alimento: 1,
    cantidad_minima: 100,
    cantidad_maxima: 200,
    unidad_medida: "g",
  },
  {
    id_dieta: 3,
    id_alimento: 3,
    cantidad_minima: 100,
    cantidad_maxima: 200,
    unidad_medida: "g",
  },
  {
    id_dieta: 3,
    id_alimento: 4,
    cantidad_minima: 1,
    cantidad_maxima: 3,
    unidad_medida: "unidades",
  },
  {
    id_dieta: 3,
    id_alimento: 5,
    cantidad_minima: 1,
    cantidad_maxima: 2,
    unidad_medida: "porciones",
  },
  {
    id_dieta: 3,
    id_alimento: 6,
    cantidad_minima: 20,
    cantidad_maxima: 60,
    unidad_medida: "g",
  },
  {
    id_dieta: 3,
    id_alimento: 9,
    cantidad_minima: 100,
    cantidad_maxima: 200,
    unidad_medida: "g",
  },
  {
    id_dieta: 3,
    id_alimento: 12,
    cantidad_minima: 10,
    cantidad_maxima: 30,
    unidad_medida: "g",
  },
];

// ============================================================
// R12. COBERTURA DE DIETAS POR GRUPOS NUTRICIONALES
//
// Esta relación indica qué grupos debe cubrir cada dieta.
// No almacena cantidades ni restricciones de alimentos.
// ============================================================

export const coberturaDietaGrupo = [
  // Dieta 1: Control de peso
  { id_dieta: 1, id_grupo_nutricional: 1 },
  { id_dieta: 1, id_grupo_nutricional: 2 },
  { id_dieta: 1, id_grupo_nutricional: 3 },
  { id_dieta: 1, id_grupo_nutricional: 4 },

  // Dieta 2: Diabetes tipo 2
  { id_dieta: 2, id_grupo_nutricional: 2 },
  { id_dieta: 2, id_grupo_nutricional: 3 },

  // Dieta 3: Nutrición general vegetariana
  { id_dieta: 3, id_grupo_nutricional: 1 },
  { id_dieta: 3, id_grupo_nutricional: 3 },
  { id_dieta: 3, id_grupo_nutricional: 4 },
];

// ============================================================
// R13. RELACIÓN ALIMENTO–GRUPO NUTRICIONAL
//
// Esta relación clasifica los alimentos.
// No incluye cantidades mínimas ni máximas.
// ============================================================

export const alimentosGruposNutricionales = [
  { id_alimento: 1, id_grupo_nutricional: 1 },  // Arroz blanco: Cereales
  { id_alimento: 2, id_grupo_nutricional: 2 },  // Pollo: Proteínas
  { id_alimento: 3, id_grupo_nutricional: 3 },  // Ensalada verde: Vegetales
  { id_alimento: 4, id_grupo_nutricional: 4 },  // Manzana: Frutas
  { id_alimento: 5, id_grupo_nutricional: 5 },  // Yogur: Lácteos
  { id_alimento: 6, id_grupo_nutricional: 6 },  // Aguacate: Grasas
  { id_alimento: 7, id_grupo_nutricional: 1 },  // Pasta integral: Cereales
  { id_alimento: 8, id_grupo_nutricional: 2 },  // Salmón: Proteínas
  { id_alimento: 9, id_grupo_nutricional: 3 },  // Brócoli: Vegetales
  { id_alimento: 10, id_grupo_nutricional: 4 }, // Jugo de naranja: Frutas
  { id_alimento: 11, id_grupo_nutricional: 5 }, // Queso fresco: Lácteos
  { id_alimento: 12, id_grupo_nutricional: 6 }, // Almendras: Grasas
];

// ============================================================
// R14. CONTENIDO DE LOS MENÚS
// ============================================================

export const contenidoMenuAlimento = [
  // Desayuno balanceado
  { id_menu: 1, id_alimento: 5, cantidad: 150, unidad_medida: "g" },
  { id_menu: 1, id_alimento: 4, cantidad: 1, unidad_medida: "unidades" },

  // Almuerzo balanceado
  { id_menu: 2, id_alimento: 1, cantidad: 100, unidad_medida: "g" },
  { id_menu: 2, id_alimento: 2, cantidad: 150, unidad_medida: "g" },
  { id_menu: 2, id_alimento: 3, cantidad: 100, unidad_medida: "g" },

  // Cena baja en carbohidratos
  { id_menu: 3, id_alimento: 8, cantidad: 150, unidad_medida: "g" },
  { id_menu: 3, id_alimento: 9, cantidad: 150, unidad_medida: "g" },

  // Merienda baja en carbohidratos rechazada
  { id_menu: 4, id_alimento: 10, cantidad: 250, unidad_medida: "ml" },
  { id_menu: 4, id_alimento: 12, cantidad: 50, unidad_medida: "g" },

  // Almuerzo vegetariano pendiente
  { id_menu: 5, id_alimento: 1, cantidad: 150, unidad_medida: "g" },
  { id_menu: 5, id_alimento: 3, cantidad: 150, unidad_medida: "g" },
  { id_menu: 5, id_alimento: 4, cantidad: 1, unidad_medida: "unidades" },
];

// ============================================================
// R15. RECETAS DE PLATOS COMPUESTOS
//
// Relaciona un alimento compuesto con sus ingredientes.
// ============================================================

export const recetasPlatosCompuestos = [
  {
    id_alimento_compuesto: 3,
    id_alimento_ingrediente: 9,
    cantidad: 70,
    unidad_medida: "g",
  },
  {
    id_alimento_compuesto: 3,
    id_alimento_ingrediente: 6,
    cantidad: 30,
    unidad_medida: "g",
  },
];

// ============================================================
// R16. CONSUMOS DE MENÚS
// ============================================================

export const consumos = [
  {
    id_consumo: 1,
    id_asignacion: 1,
    fecha_consumo: "2026-10-04",
    estado_consumo: "consumido",
    observaciones: null,
  },
  {
    id_consumo: 2,
    id_asignacion: 2,
    fecha_consumo: "2026-10-04",
    estado_consumo: "consumido",
    observaciones: "Se consumió la mayor parte del menú.",
  },
  {
    id_consumo: 3,
    id_asignacion: 3,
    fecha_consumo: "2026-10-05",
    estado_consumo: "parcial",
    observaciones: "No se consumió toda la porción.",
  },
  {
    id_consumo: 4,
    id_asignacion: 4,
    fecha_consumo: "2026-10-06",
    estado_consumo: "pendiente",
    observaciones: null,
  },
];


// ============================================================
// R17.INSCRIPCIONES PACIENTE–DIETA
// ============================================================

export const inscripcionesPacienteDieta = [
  { id_usuario: 5, id_dieta: 1, fecha_inscripcion: "2026-09-22" },
  { id_usuario: 5, id_dieta: 2, fecha_inscripcion: "2026-09-28" },
  { id_usuario: 6, id_dieta: 2, fecha_inscripcion: "2026-09-26" },
  { id_usuario: 6, id_dieta: 3, fecha_inscripcion: "2026-10-02" },
  { id_usuario: 7, id_dieta: 3, fecha_inscripcion: "2026-10-01" },
];
// ============================================================
// OBJETO GENERAL DE DATOS SIMULADOS
// ============================================================

export const mockData = {
  usuarios,
  solicitudes,
  dietas,
  atiende,
  gruposNutricionales,
  alimentos,
  fichasNutricionales,
  menus,
  valoraciones,
  menusAsignados,

  // Relaciones independientes
  restriccionesDietaAlimento,
  coberturaDietaGrupo,
  alimentosGruposNutricionales,
  contenidoMenuAlimento,
  recetasPlatosCompuestos,
  consumos,
  inscripcionesPacienteDieta
};
