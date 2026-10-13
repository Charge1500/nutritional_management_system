import { Navbar } from "../layouts/Navbar";
import { Sidebar } from "../layouts/Sidebar";


// Recibe los datos del usuario y el contenido de la página mediante props.
export const NutritionistLayout = ({ children, user }) => {
  return (
    // Contenedor principal que ocupa, como mínimo, toda la altura de la pantalla.
    // También establece el color de fondo general de la aplicación.
    <div className="min-h-screen bg-background">

      {/* Barra superior con el nombre y el rol del usuario. */}
      <Navbar
        userName={user.nombre}
        role={user.rol}
      />

      {/* Contenedor que organiza el menú lateral y el contenido principal
          horizontalmente mediante Flexbox. */}
      <div className="flex">

        {/* Menú lateral de navegación.
            El rol permite adaptar las opciones al tipo de usuario. */}
        <Sidebar role={user.rol} />

        {/* Área donde se muestra el contenido de la página actual.
            La clase flex-1 hace que ocupe el espacio disponible. */}
        <main className="flex-1 p-6">

          {/* children representa el contenido que se inserta dentro del layout.*/}
          {children}

        </main>
      </div>
    </div>
  );
};