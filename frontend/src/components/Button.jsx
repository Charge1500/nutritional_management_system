export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}) => {
  // Definimos los estilos visuales disponibles para el botón.
  const variants = {
    primary:
      "bg-health-500 text-white hover:bg-health-600",

    secondary:
      "border border-gray-300 text-content hover:bg-gray-50",

    danger:
      "text-red-500 hover:text-red-700",
  };

  return (
    // Renderizamos el botón con sus propiedades y estilos.
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors
        ${variants[variant] || variants.primary}
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        ${className}`}
    >
      {/* Mostramos el contenido que se pase al componente. */}
      {children}
    </button>
  );
};