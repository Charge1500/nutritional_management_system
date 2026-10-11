import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../hooks/useAuth';
import { AppRouter } from '../routes/AppRoutes';

// Datos propios del test: no dependen del mockData real
vi.mock('../data/mockData', () => ({
  usuarios: [
    { id_usuario: 1, nombre: 'Ana Admin', email: 'admin@test.cu', contrasenna: 'admin123', rol: 'admin' },
    { id_usuario: 4, nombre: 'Pablo Paciente', email: 'paciente@test.cu', contrasenna: 'pac12345', rol: 'paciente' },
    { id_usuario: 5, nombre: 'Nuevo Paciente', email: null, contrasenna: '1234', rol: 'paciente' },
  ],
}));

const SESSION_KEY = 'session_user';

const renderAt = (path) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRouter />
      </MemoryRouter>
    </AuthProvider>,
  );

const setSession = (rol) =>
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id_usuario: 99, nombre: 'Test', rol }));

const heading = (name) => screen.getByRole('heading', { name });

describe('Protección de rutas', () => {
  beforeEach(() => localStorage.clear());

  it('sin sesión, /admin redirige al login', () => {
    renderAt('/admin');
    expect(heading('Inicia sesión en tu cuenta')).toBeInTheDocument();
  });

  it('un paciente que escribe /admin termina en su propio dashboard', () => {
    setSession('paciente');
    renderAt('/admin');
    expect(heading('Dashboard Paciente')).toBeInTheDocument();
  });

  it('un paciente no accede a /reportes', () => {
    setSession('paciente');
    renderAt('/reportes');
    expect(heading('Dashboard Paciente')).toBeInTheDocument();
  });

  it('un admin sí accede a /admin/usuarios', () => {
    setSession('admin');
    renderAt('/admin/usuarios');
    expect(heading('Gestión de Usuarios')).toBeInTheDocument();
  });

  it('la sesión guardada sobrevive a una recarga (sin pasar por el login)', () => {
    setSession('nutricionista');
    renderAt('/nutricionista/menus');
    expect(heading('Gestión de Menús')).toBeInTheDocument();
  });

  it.each([
    ['JSON corrupto', '{no-es-json'],
    ['rol inventado', JSON.stringify({ nombre: 'X', rol: 'superadmin' })],
    ['rol heredado', JSON.stringify({ nombre: 'X', rol: 'toString' })],
  ])('ignora una sesión inválida (%s)', (_label, raw) => {
    localStorage.setItem(SESSION_KEY, raw);
    renderAt('/admin');
    expect(heading('Inicia sesión en tu cuenta')).toBeInTheDocument();
  });

  it('una URL desconocida sin sesión va al login', () => {
    renderAt('/ruta/que/no/existe');
    expect(heading('Inicia sesión en tu cuenta')).toBeInTheDocument();
  });
});

describe('Login simulado', () => {
  beforeEach(() => localStorage.clear());

  it('entra con ID + contraseña, redirige según el rol y no guarda la contraseña', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    await user.type(screen.getByLabelText('ID de usuario o correo'), '4');
    await user.type(screen.getByLabelText('Contraseña'), 'pac12345');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(heading('Dashboard Paciente')).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY));
    expect(stored.rol).toBe('paciente');
    expect(stored).not.toHaveProperty('contrasenna');
  });

  it('también entra con el correo', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    await user.type(screen.getByLabelText('ID de usuario o correo'), 'ADMIN@test.cu');
    await user.type(screen.getByLabelText('Contraseña'), 'admin123');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(heading('Dashboard Admin')).toBeInTheDocument();
  });

  it('rechaza una contraseña incorrecta', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    await user.type(screen.getByLabelText('ID de usuario o correo'), '4');
    await user.type(screen.getByLabelText('Contraseña'), 'mala');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('una cuenta pendiente NO puede entrar con la contraseña temporal', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    await user.type(screen.getByLabelText('ID de usuario o correo'), '5');
    await user.type(screen.getByLabelText('Contraseña'), '1234');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('activa una cuenta pendiente y entra con su dashboard', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    await user.click(screen.getByRole('button', { name: 'Primer acceso' }));
    await user.type(screen.getByLabelText('ID de usuario'), '5');
    await user.type(screen.getByLabelText('Nuevo correo electrónico'), 'nuevo@test.cu');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'secreta123');
    await user.click(screen.getByRole('button', { name: 'Activar cuenta' }));
    expect(heading('Dashboard Paciente')).toBeInTheDocument();
  });

  it('no permite activar una cuenta ya configurada ni usar un correo repetido', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    await user.click(screen.getByRole('button', { name: 'Primer acceso' }));
    await user.type(screen.getByLabelText('ID de usuario'), '4');
    await user.type(screen.getByLabelText('Nuevo correo electrónico'), 'otro@test.cu');
    await user.type(screen.getByLabelText('Nueva contraseña'), 'secreta123');
    await user.click(screen.getByRole('button', { name: 'Activar cuenta' }));
    expect(screen.getByRole('alert')).toHaveTextContent('ID inválido');
  });

  it('cerrar sesión vuelve al login y borra la sesión', async () => {
    const user = userEvent.setup();
    setSession('jefe');
    renderAt('/jefe');
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(heading('Inicia sesión en tu cuenta')).toBeInTheDocument();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('con sesión activa, /login reenvía al dashboard del rol', () => {
    setSession('nutricionista');
    renderAt('/login');
    expect(heading('Dashboard Nutricionista')).toBeInTheDocument();
  });
});

describe('Sidebar por rol', () => {
  beforeEach(() => localStorage.clear());

  it('cada rol ve solo sus enlaces', () => {
    setSession('paciente');
    renderAt('/paciente');
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    expect(nav).toHaveTextContent('Registrar consumo');
    expect(nav).not.toHaveTextContent('Usuarios');
    expect(nav).not.toHaveTextContent('Reportes');
  });
});
