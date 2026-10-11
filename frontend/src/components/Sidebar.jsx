import { NavLink } from 'react-router-dom';
import { userAuth } from '../hooks/userAuth';
import { NAV_LINKS_BY_ROLE } from '../routes/navigation';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = userAuth();
  // userAuth garantiza que user.rol es válido; el `?? []` cubre el caso sin sesión
  const links = NAV_LINKS_BY_ROLE[user?.rol] ?? [];

  return (
    <>
      {/* Fondo oscuro que cierra el menú al tocar fuera (solo en móvil) */}
      {isOpen && (
        <div 
            className="fixed inset-0 z-20 bg-black/50 lg:hidden" 
            onClick={() => setIsOpen(false)} 
            aria-hidden="true" 
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 shrink-0 border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:inset-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col pt-16 lg:pt-0">
          <nav aria-label="Navegación principal" className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
            {links.map((link) => (
              // `end` evita que /nutricionista/menus quede activo estando en /nutricionista/menus/nuevo
              <NavLink
                key={link.path}
                to={link.path}
                end
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};
