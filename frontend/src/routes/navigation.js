import { ROLES } from '../data/roles';

// Enlaces del Sidebar por rol
export const NAV_LINKS_BY_ROLE = Object.freeze({
  [ROLES.PACIENTE]: [
    { name: 'Dashboard', path: '/paciente' },
    { name: 'Mis menús', path: '/paciente/menus' },
    { name: 'Registrar consumo', path: '/paciente/consumo' },
    { name: 'Solicitar revaloración', path: '/paciente/revaloracion' },
    { name: 'Mis valoraciones', path: '/paciente/valoraciones' },
  ],
  [ROLES.NUTRICIONISTA]: [
    { name: 'Dashboard', path: '/nutricionista' },
    { name: 'Menús', path: '/nutricionista/menus' },
    { name: 'Nuevo menú', path: '/nutricionista/menus/nuevo' },
    { name: 'Alimentos', path: '/nutricionista/alimentos' },
    { name: 'Nuevo alimento', path: '/nutricionista/alimentos/nuevo' },
    { name: 'Fichas nutricionales', path: '/nutricionista/ficha-nutricional' },
    { name: 'Reportes', path: '/reportes' },
    { name: 'Valoraciones', path: '/nutricionista/valoraciones' },
    { name: 'Solicitudes', path: '/nutricionista/solicitudes' },
  ],
  [ROLES.JEFE]: [
    { name: 'Dashboard', path: '/jefe' },
    { name: 'Validar menús', path: '/jefe/menus' },
    { name: 'Validar alimentos', path: '/jefe/alimentos' },
    { name: 'Reportes', path: '/reportes' },
    { name: 'Dietas', path: '/jefe/dietas' },
    { name: 'Grupos', path: '/jefe/grupos' },
  ],
  [ROLES.ADMIN]: [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Usuarios', path: '/admin/usuarios' },
    { name: 'Duplicados de alimentos', path: '/admin/alimentos' },
    { name: 'Reportes', path: '/reportes' },
    { name: 'Solicitudes', path: '/admin/solicitudes' },
  ],
});
