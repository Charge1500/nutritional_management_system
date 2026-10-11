import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS } from '../data/roles';

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav aria-label="Barra superior" className="fixed top-0 z-40 w-full border-b border-gray-200 bg-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <button onClick={toggleSidebar} aria-label="Abrir menú de navegación"
              className="mr-4 text-gray-500 focus:outline-none lg:hidden">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-xl font-bold text-blue-600">MediCare</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
              <p className="text-xs text-gray-500">{ROLE_LABELS[user?.rol]}</p>
            </div>
            <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-800">
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
