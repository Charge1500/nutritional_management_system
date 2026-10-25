import { Link } from 'react-router-dom';

// Lista de reportes disponibles. Para agregar otro reporte basta con añadir un objeto aquí:
const REPORTS = [
  {
    path: '/reportes/menus-por-dieta',
    title: 'Reporte 1: Menús generados por dieta',
    description: 'Menús generados automáticamente para una dieta, con creador, fecha y parámetros.',
  },
  {
    path: '/reportes/alimentos-mas-utilizados',
    title: 'Reporte 2: Alimentos más utilizados',
    description: 'Frecuencia de alimentos más utilizados en los menús finales de una dieta, por nivel calórico y grupo nutricional.',
  },
  {
    path: '/reportes/menus-validados',
    title: 'Reporte 3: Menús validados por revisor',
    description: 'Menús validados por un revisor, con fecha de validación y observaciones.',
  },
  {
    path: '/reportes/desempenno-nutricional',
    title: 'Reporte 4: Desempeño ante un menú',
    description: 'Desempeño ante un menú, clasificando los alimentos por nivel calórico y tasas de aceptación.',
  },
  {
    path: '/reportes/comparar-menus',
    title: 'Reporte 5: Comparación entre menús',
    description: 'Comparación de los menús generados para diferentes dietas, análisis de equilibrio,grupo nutricional y nivel calórico.',
  },
  {
    path: '/reportes/correlacion-por-dieta',
    title: 'Reporte 6: Correlación y Rechazo.',
    description: 'Análisis para cada dieta y top 10 alimentos con tasa de rechazo más alta. ',
  },
];

export function ReportsHome() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-content">Reportes del Sistema</h1>
        <p className="mt-1 text-sm text-content-muted">Seleccione el reporte que desee consultar.</p>
      </header>
      {/* Rejilla responsiva: 1 columna en móvil, 2 en pantallas medianas */}
      <div className="grid gap-4 md:grid-cols-2">
        {REPORTS.map((report) => (
          // Link navega sin recargar la página)
          <Link
            key={report.path}
            to={report.path}
            className="rounded-xl border border-gray-100 bg-surface p-5 shadow-soft transition hover:border-health-500 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-content">{report.title}</h2>
            <p className="mt-2 text-sm text-content-muted">{report.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}