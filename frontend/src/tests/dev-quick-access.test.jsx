import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider } from '../hooks/useAuth';
import { AppRoutes } from '../routes/AppRoutes';

// aquí no se mockea mockData. Se prueba con los usuarios reales del equipo,
// para asegurar que el acceso rápido de desarrollo funciona con cada rol.
const renderLogin = () =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>,
  );

describe('Acceso rápido de desarrollo (con mockData real)', () => {
  beforeEach(() => localStorage.clear());

  it.each([
    ['Paciente', 'Dashboard Paciente'],
    ['Nutricionista', 'Dashboard Nutricionista'],
    ['Jefe de nutrición', 'Dashboard Jefe'],
    ['Administrador', 'Dashboard Admin'],
  ])('el botón "%s" entra a "%s"', async (buttonName, expectedHeading) => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('button', { name: buttonName }));
    expect(screen.getByRole('heading', { name: expectedHeading })).toBeInTheDocument();
  });
});
