import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

// Estructura común de todas las pantallas privadas: navbar arriba, sidebar a la izquierda, contenido en centro
export const DashboardLayout = () => {
  // Solo afecta a pantallas pequeñas, en escritorio el sidebar siempre es visible
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar toggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="flex h-screen overflow-hidden pt-16">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Aquí se renderiza la página hija que coincida con la ruta */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
