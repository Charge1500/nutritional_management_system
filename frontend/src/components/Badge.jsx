export const Badge = ({ status }) => {
  const statusConfig = {
    borrador: { bg: 'bg-slate-100', text: 'text-status-draft', label: 'Borrador' },
    pendiente: { bg: 'bg-amber-100', text: 'text-status-pending', label: 'Pendiente' },
    aprobado: { bg: 'bg-green-100', text: 'text-status-approved', label: 'Aprobado' },
    rechazado: { bg: 'bg-red-100', text: 'text-status-rejected', label: 'Rechazado' },
    atendida: { bg: 'bg-green-100', text: 'text-status-approved', label: 'Atendida' },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.borrador;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};