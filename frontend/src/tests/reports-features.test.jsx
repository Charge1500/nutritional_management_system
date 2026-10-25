import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { formatDate, formatParameters } from '../utils/reportFormatters';
import { AuthProvider } from '../hooks/useAuth';
import { AppRoutes } from '../routes/AppRoutes';

describe('Utilidades de Reportes y Seguridad de Formato', () => {
  it('formatDate formatea correctamente fechas ISO y de tipo string a formato español sin desfases', () => {
    expect(formatDate('2026-09-14T10:30:00Z')).toBe('14/09/2026');
    expect(formatDate('2026-10-02')).toBe('02/10/2026');
    expect(formatDate(null)).toBe('-');
    expect(formatDate('fecha-invalida')).toBe('-');
  });

  it('formatParameters procesa objetos de parámetros de forma segura y legible', () => {
    const params = { targetCalories: 1500, mealsPerDay: 4, excludedGroups: ['Lácteos'], proporcion_por_tipo: { entrante: 1 } };
    const result = formatParameters(params);
    expect(result).toContain('Calorías objetivo: 1500');
    expect(result).toContain('Comidas por día: 4');
    expect(result).toContain('Grupos excluidos: Lácteos');
    expect(result).toContain('entrante: 1');
  });

  it('formatParameters maneja valores vacíos, nulos o primitivos sin romper la interfaz', () => {
    expect(formatParameters(null)).toBe('Sin parámetros');
    expect(formatParameters({})).toBe('Sin parámetros');
    expect(formatParameters('texto plano')).toBe('texto plano');
  });
});

describe('Control de Acceso y Seguridad en Rutas de Reportes', () => {
  const SESSION_KEY = 'session_user';

  beforeEach(() => localStorage.clear());

  it('un usuario con rol de paciente NO puede acceder al Hub de Reportes (/reportes)', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id_usuario: 5, nombre: 'Carla', rol: 'paciente' }));
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/reportes']}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>
    );
    // Debe redirigir al dashboard del paciente por falta de privilegios
    expect(screen.getByRole('heading', { name: 'Dashboard Paciente' })).toBeInTheDocument();
  });

  it('un usuario con rol de nutricionista SÍ puede acceder al Hub de Reportes y visualizar el menú', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id_usuario: 1, nombre: 'Ana', rol: 'nutricionista' }));
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/reportes']}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>
    );
    expect(screen.getByRole('heading', { name: 'Reportes del Sistema' })).toBeInTheDocument();
  });

  it('un usuario con rol de jefe de nutrición SÍ puede acceder a sub-rutas de reportes (/reportes/menus-por-dieta)', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id_usuario: 3, nombre: 'Lianet', rol: 'jefe' }));
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/reportes/menus-por-dieta']}>
          <AppRoutes />
        </MemoryRouter>
      </AuthProvider>
    );
    expect(screen.getByRole('heading', { name: 'Reporte 1: Menús generados automáticamente' })).toBeInTheDocument();
  });
});