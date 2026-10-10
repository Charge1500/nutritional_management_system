export const Input = ({
  label,
  id,
  type = 'text',
  error,
  className = '',
  context = 'health',
  ...props
}) => {
  const focusRing = context === 'food' 
    ? 'focus:border-food-500 focus:ring-food-500' 
    : 'focus:border-health-500 focus:ring-health-500';

  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-content">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`block w-full rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm text-content placeholder-gray-400 shadow-sm focus:outline-none focus:ring-1 transition-colors ${focusRing} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};