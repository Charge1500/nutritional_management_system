export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-surface rounded-xl shadow-soft border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
};