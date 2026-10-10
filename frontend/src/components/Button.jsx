export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'health',
  className = "",
  disabled = false,
  ...props
}) => {
  const baseStyles = "inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Definimos los estilos visuales disponibles para el botón.
  // Usa los colores específicos definidos en la config de Tailwind 
  const variants = {
    health: "bg-health-600 text-white hover:bg-health-700 focus:ring-health-500 shadow-sm",
    food: "bg-food-600 text-white hover:bg-food-700 focus:ring-food-500 shadow-sm",
    outline: "bg-surface border border-gray-300 text-content hover:bg-gray-50 focus:ring-health-500",
    ghost: "bg-transparent text-content-muted hover:text-content hover:bg-gray-100 focus:ring-gray-500"
  };

  return (
    // Renderizamos el botón con sus propiedades y estilos.
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles} 
        ${variants[variant] || variants.health}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}`}
        {...props}
    >
      {children}
    </button>
  );
};