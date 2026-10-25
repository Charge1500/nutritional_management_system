import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, ROLE_HOME, ROLE_LABELS } from '../../data/roles';

// Los mensajes en español que ve el usuario para cada código de error del hook useAuth
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

const inputClass = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-health-500 focus:border-health-500 sm:text-sm";

export const Login = () => {
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const { user, login, firstTimeSetup, loginAsRole } = useAuth();
  const navigate = useNavigate();
  
  // Si el usuario ya está autenticado, redirigir a su panel correspondiente
  // (Va después de los hooks para respetar las reglas de React)
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
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-soft border border-gray-100">

        {/* Cabecera institucional con icono clinico y nombre */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-health-50 flex items-center justify-center mb-3">
            <svg className="h-7 w-7 text-health-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>      
          <h2 className="text-3xl font-extrabold text-content tracking-tight">NutriVital</h2>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-health-600">Sistema de Gestión Nutricional</p>
          <p className="mt-2 text-sm text-content-muted">
            {isFirstTime ? 'Configura tu nueva cuenta' : 'Inicia sesión en tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isFirstTime ? (
            <>
            <div>
              <label htmlFor="id" className="block text-xs font-medium text-content-muted mb-1">ID de usuario provista</label>
              <input id="id" name="id" type="text" inputMode="numeric" placeholder="Ejemplo: 1"
                required autoComplete="username" value={formData.id} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="newEmail" className="block text-xs font-medium text-content-muted mb-1">Nuevo correo electrónico</label>
              <input id="newEmail" name="newEmail" type="email" placeholder="Ejemplo: usuario@gmail.com"
                required autoComplete="email" value={formData.newEmail} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-xs font-medium text-content-muted mb-1">Nueva contraseña</label>
              <input id="newPassword" name="newPassword" type="password" placeholder="Nueva contraseña (mínimo 6 caracteres)"
                required autoComplete="new-password" value={formData.newPassword} onChange={handleChange} className={inputClass} />
            </div>
          </>
          ) : (
            <>
            <div>
              <label htmlFor="identifier" className="block text-xs font-medium text-content-muted mb-1">ID de usuario o correo</label>
              <input id="identifier" name="identifier" type="text" placeholder="Ejemplo: 1 o usuario@gmail.com"
                required autoComplete="username" value={formData.identifier} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-content-muted mb-1">Contraseña</label>
              <input id="password" name="password" type="password" placeholder="Contraseña"
                required autoComplete="current-password" value={formData.password} onChange={handleChange} className={inputClass} />
            </div>
            </>
          )}

          {error && (
            <div className='rounded-md bg-red-50 p-3'>
              <p role="alert" className="text-center text-sm text-red-600">{error}</p>
            </div>
          )}

          <button type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-health-600 hover:bg-health-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-health-500 transition-colors">
            {isFirstTime ? 'Activar cuenta' : 'Ingresar'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button type="button" onClick={toggleMode} className="text-sm font-medium text-health-600 hover:text-health-700 transition-colors">
            {isFirstTime ? 'Ya tengo mi cuenta configurada' : 'Primer acceso? Activa tu cuenta aquí'}
          </button>
        </div>

        {/* Acceso rápido por rol: solo existe en desarrollo */}
        {import.meta.env.DEV && (
          <div className="border-t border-gray-100 pt-4 mt'6">
            <p className="mb-2 text-center text-xs text-content-muted font-semibold uppercase tracking-wider">Acceso rápido (solo desarrollo)</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ROLES).map((rol) => (
                <button key={rol} type="button" onClick={() => handleAuthResult(loginAsRole(rol))}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-content hover:bg-health-50 hover:border-health-200 hover:text-health-700 transition-colors">
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
