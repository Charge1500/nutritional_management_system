export const Navbar = ({ userName, role }) => {
  return (
    <nav className="bg-surface border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 bg-health-500 rounded-lg"></div>
        <span className="text-xl font-bold text-content">MediCare</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-right">
          <p className="font-medium text-content">{userName || "Usuario"}</p>
          <p className="text-content-muted capitalize">{role || "Rol"}</p>
        </div>
        <button className="text-sm font-medium text-red-500 hover:text-red-700">
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};