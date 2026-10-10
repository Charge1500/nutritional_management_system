export const Sidebar = ({ role }) => {
  const routes = {
    paciente: [
      { name: 'Mis Menús', path: '/paciente/menus' },
      { name: 'Registro de Consumo', path: '/paciente/consumo' },
      { name: 'Solicitar Revaloración', path: '/paciente/revaloracion' },
    ],
    nutricionista: [
      { name: 'Fichas Nutricionales', path: '/nutricionista/ficha-nutricional' },
      { name: 'Gestión de Menús', path: '/nutricionista/menus' },
      { name: 'Catálogo de Alimentos', path: '/nutricionista/alimentos' },
    ],
    jefe: [
      { name: 'Aprobación de Menús', path: '/jefe/menus' },
      { name: 'Aprobación de Alimentos', path: '/jefe/alimentos' },
      { name: 'Reportes y Analíticas', path: '/reportes' },
    ],
    admin: [
      { name: 'Gestión de Usuarios', path: '/admin/usuarios' },
      { name: 'Gestión de Alimentos', path: '/admin/alimentos' },
      { name: 'Reportes del Sistema', path: '/reportes' },
    ],
  };

  const currentLinks = routes[role] || [];

  return (
    <aside className="w-64 bg-surface border-r border-gray-200 h-[calc(100vh-65px)] overflow-y-auto hidden md:block">
      <div className="flex flex-col p-4 space-y-2">
        <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-2">
          Navegación principal
        </p>
        {currentLinks.map((link) => (
          <a
            key={link.path}
            href={link.path}
            className="px-3 py-2 rounded-lg text-sm font-medium text-content hover:bg-health-50 hover:text-health-700 transition-colors"
          >
            {link.name}
          </a>
        ))}
      </div>
    </aside>
  );
};