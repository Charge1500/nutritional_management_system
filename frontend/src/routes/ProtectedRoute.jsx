import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME } from '../data/roles';

/**
 * - Sin `allowedRoles`: solo exige haber iniciado sesión.
 * - Con `allowedRoles`: además exige que el rol del usuario esté en la lista.
 (esto es control de experiencia de usuario, no de seguridad. La autorización real se hará en el backend)
 */
export const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to={ROLE_HOME[user.rol]} replace />;
  }

  return <Outlet />;
};
