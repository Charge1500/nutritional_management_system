import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/userAuth';
import { ROLES, ROLE_HOME, ROLE_LABELS } from '../data/roles';

// Mensajes que ve el usuario para cada código de error del hook useAuth
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Credenciales incorrectas. ID/correo o contraseña incorrectos. Si es tu primer acceso, usa la opción «Primer acceso».',
  NOT_ELIGIBLE: 'ID inválido. No se pudo activar la cuenta. Verifica tu ID o contacta al administrador.',
  INVALID_EMAIL: 'Introduce un correo electrónico válido.',
  WEAK_PASSWORD: 'La contraseña debe tener al menos 6 caracteres y no puede ser la temporal.',
  EMAIL_IN_USE: 'Ese correo electrónico ya está en uso en otra cuenta.',
  ONLY_IN_DEVELOP: 'Esta función solo está disponible en entorno de desarrollo.',
  ROL_NOT_FOUND: 'No se encontró un usuario de prueba para este rol.'
};

const EMPTY_FORM = { id: '', newEmail: '', newPassword: '', identifier: '', password: ''    };

const inputClass = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

export const Login = () => {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const { user, login, firstTimeSetup, loginAsRole } = useAuth();
  const navigate = useNavigate();
  
  // Si el usuario ya está autenticado, redirigir a su panel correspondiente
  // (Va después de los hooks para respetar las reglas de React.)
  if (user){
    return <Navigate to={ROLE_HOME[user.rol]} replace />;
  } 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMode = () => {
    setIsFirstTime(!isFirstTime);
    setFormData(EMPTY_FORM);
    setError('');
  };

  const handleAuthResult = ({ user: loggedUser, error: authError }) => {
    if (authError) {
      setError(ERROR_MESSAGES[authError] || authError);
    } else if (loggedUser) {
      navigate(ROLE_HOME[loggedUser.rol], { replace: true });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if(isFirstTime)
    {
        const result = firstTimeSetup(formData.id, formData.newEmail, formData.newPassword);
        handleAuthResult(result);
    }
    else
    {
        const result = login(formData.identifier, formData.password);
        handleAuthResult(result);
    }
  };

  return (
    <div className="flex min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">MediCare</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isFirstTime ? 'Configura tu nueva cuenta' : 'Inicia sesión en tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isFirstTime ? (
            <>
              <label htmlFor="id" className="sr-only">ID de usuario</label>
              <input id="id" name="id" type="text" inputMode="numeric" placeholder="ID de usuario"
                required autoComplete="username" value={formData.id} onChange={handleChange} className={inputClass} />

              <label htmlFor="newEmail" className="sr-only">Nuevo correo electrónico</label>
              <input id="newEmail" name="newEmail" type="email" placeholder="Nuevo correo electrónico"
                required autoComplete="email" value={formData.newEmail} onChange={handleChange} className={inputClass} />

              <label htmlFor="newPassword" className="sr-only">Nueva contraseña</label>
              <input id="newPassword" name="newPassword" type="password" placeholder="Nueva contraseña (mínimo 6 caracteres)"
                required autoComplete="new-password" value={formData.newPassword} onChange={handleChange} className={inputClass} />
            </>
          ) : (
            <>
              <label htmlFor="identifier" className="sr-only">ID de usuario o correo</label>
              <input id="identifier" name="identifier" type="text" placeholder="ID de usuario o correo"
                required autoComplete="username" value={formData.identifier} onChange={handleChange} className={inputClass} />

              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input id="password" name="password" type="password" placeholder="Contraseña"
                required autoComplete="current-password" value={formData.password} onChange={handleChange} className={inputClass} />
            </>
          )}

          {error && <p role="alert" className="text-center text-sm text-red-600">{error}</p>}

          <button type="submit"
            className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {isFirstTime ? 'Activar cuenta' : 'Ingresar'}
          </button>
        </form>

        <div className="text-center">
          <button type="button" onClick={toggleMode} className="text-sm text-blue-600 hover:text-blue-500">
            {isFirstTime ? 'Ya tengo mi cuenta configurada' : 'Primer acceso'}
          </button>
        </div>

        {/* Acceso rápido por rol: solo existe en desarrollo (Vite elimina este bloque en producción) */}
        {import.meta.env.DEV && (
          <div className="border-t border-gray-200 pt-4">
            <p className="mb-2 text-center text-xs text-gray-500">Acceso rápido (solo desarrollo)</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ROLES).map((rol) => (
                <button key={rol} type="button" onClick={() => handleAuthResult(loginAsRole(rol))}
                  className="rounded-md border border-gray-300 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100">
                  {ROLE_LABELS[rol]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
