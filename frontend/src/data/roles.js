/*
 - Nombres oficiales de cada rol.
 - Para usar siempre estas constantes (no strings sueltos como 'administrador')
 */

export const ROLES = Object.freeze({
  PACIENTE: 'paciente',
  NUTRICIONISTA: 'nutricionista',
  JEFE: 'jefe',
  ADMIN: 'admin',
});

/* Dashboard de cada rol. */

export const ROLE_HOME = Object.freeze({
  [ROLES.PACIENTE]: '/paciente',
  [ROLES.NUTRICIONISTA]: '/nutricionista',
  [ROLES.JEFE]: '/jefe',
  [ROLES.ADMIN]: '/admin',
});

/* Texto que el usuario ve en la interfaz (el valor interno sigue siendo el nombre corto) */

export const ROLE_LABELS = Object.freeze({
  [ROLES.PACIENTE]: 'Paciente',
  [ROLES.NUTRICIONISTA]: 'Nutricionista',
  [ROLES.JEFE]: 'Jefe de nutrición',
  [ROLES.ADMIN]: 'Administrador',
});

/*
 - Indica si un valor es un rol válido.
 - Se usa hasOwn y no 'rol in ROLE_HOME' para rechazar claves heredadas, 
 como  'toString' o '__proto__' (de un localStorage manipulado por ejemplo)
 */

export const isValidRole = (rol) => Object.hasOwn(ROLE_HOME, rol);
