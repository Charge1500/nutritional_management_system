export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-content bg-opacity-50 p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-surface p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-content">{title}</h3>
          <button 
            onClick={onClose}
            className="text-content-muted hover:text-content focus:outline-none"
          >
            ✕
          </button>
        </div>
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};