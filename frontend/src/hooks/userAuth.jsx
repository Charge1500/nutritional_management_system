import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { usuarios as mockUsuarios } from '../data/mockData';
import { isValidRole } from '../data/roles';

const AuthContext = createContext(null);

// Clave de localStorage donde se guarda la sesión (sin contraseña)
const SESSION_KEY = 'session_user';

// Contraseña temporal que deja el admin al crear una cuenta (solo simulación)
const TEMP_PASSWORD = '1234';
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// Una cuenta está en estado pendiente mientras conserve la contraseña temporal del admin. 
const isPendingActivation = (u) => u.contrasenna === TEMP_PASSWORD;

// Lee la sesión guardada, devuelve null si no existe, está corrupta o tiene un rol inválido.
const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    return stored && isValidRole(stored.rol) ? stored : null;
  } 
  catch {
    return null;
  }
};

const saveSession = (session) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Almacenamiento no disponible (modo privado, cuota llena): la sesión dura solo en memoria
  }
};

// Copia del usuario sin la contraseña: es lo único que se guarda en el estado y en localStorage

// eslint-disable-next-line no-unused-vars
const toSession = ({ contrasenna, ...publicData }) => publicData;

export const AuthProvider = ({ children }) => {
  // Inicialización lazy: la sesión se lee antes del primer render.
  // Con useEffect el primer render tendría user=null y las rutas protegidas mandarían al login
  
  const [user, setUser] = useState(readSession);
  const [dbUsuarios, setDbUsuarios] = useState(mockUsuarios);

  const startSession = useCallback((rawUser) => {
    const session = toSession(rawUser);
    setUser(session);
    saveSession(session);
    return session;
  }, []);

  // Inicio de sesión normal con ID o correo + contraseña. Devuelve { user, error }
  const login = useCallback((identifier, password) => {
      const wanted = String(identifier).trim().toLowerCase();
      const found = dbUsuarios.find((u) => {
        const matchesId = String(u.id_usuario) === wanted;
        const matchesEmail = Boolean(u.email) && u.email.toLowerCase() === wanted;
        return (matchesId || matchesEmail) && u.contrasenna === password;
      });
      // Las cuentas pendientes no pueden entrar por aquí pq deben activarse primero
      if (!found || isPendingActivation(found) || !isValidRole(found.rol)) {
        return { user: null, error: 'INVALID_CREDENTIALS' };
      }
      return { user: startSession(found), error: null };
    },
    [dbUsuarios, startSession],
  );

  // Activación de cuenta creada por el admin: define correo y contraseña. Devuelve { user, error }
  const firstTimeSetup = useCallback((id, newEmail, newPassword) => {
      const wantedId = String(id).trim();
      const pending = dbUsuarios.find((u) => String(u.id_usuario) === wantedId && isPendingActivation(u),);
      
      if (!pending) return { user: null, error: 'Usuario no elegible' };

      const email = newEmail.trim().toLowerCase();
      if (!EMAIL_REGEX.test(email)) return { user: null, error: 'Correo inválido' };
      if (newPassword.length < MIN_PASSWORD_LENGTH || newPassword === TEMP_PASSWORD) {
        return { user: null, error: 'Contraseña débil' };
      }

      const emailTaken = dbUsuarios.some((u) => u !== pending && u.email && u.email.toLowerCase() === email,);
      if (emailTaken) return { user: null, error: 'Correo en uso' };

      const activated = { ...pending, email, contrasenna: newPassword };
      setDbUsuarios((prev) => prev.map((u) => (u === pending ? activated : u)));
      return { user: startSession(activated), error: null };
    }, [dbUsuarios, startSession],
  );

  // acceso rápido por rol para desarrollo. En producción no hace nada
  const loginAsRole = useCallback((rol) => {
      if (!import.meta.env.DEV) return { user: null, error: 'Solo desarrollo' };
      const found = dbUsuarios.find((u) => u.rol === rol && !isPendingActivation(u));
      if (!found) return { user: null, error: 'Rol no encontrado' };
      return { user: startSession(found), error: null };},
    [dbUsuarios, startSession],
  );

  const logout = useCallback(() => {setUser(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } 
    catch {
      // nada que limpiar si el almacenamiento no está disponible
    }}, 
    []);

  const value = useMemo(() => 
    ({ user, login, logout, firstTimeSetup, loginAsRole }),
    [user, login, logout, firstTimeSetup, loginAsRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
};
