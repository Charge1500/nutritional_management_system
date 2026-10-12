import { Card } from "../Card";

import { Button } from "../Button";
import { useNavigate } from "react-router-dom";

// Componente que representa una tarjeta con la información de una dieta.
// Recibe los datos de la dieta mediante la prop "diet".
export const DietCard = ({ diet }) => {

   // Permite navegar a otra ruta de la aplicación.
  const navigate = useNavigate();

  // Abre la página de detalles de la dieta seleccionada.
  const verDetalles = () => {
    navigate(`/nutricionista/dietas/${diet.id_dieta}`);
  };
  return (
    // Reutilizamos Card para mantener el diseño común de las tarjetas.
    <Card className="space-y-4">

      {/* Mostramos el nombre de la dieta como título principal. */}
      <h3 className="text-lg font-semibold text-content">
        {diet.nombre_dieta}
      </h3>

      {/* Mostramos el identificador de la dieta. */}
      <p className="text-sm text-content-muted">
        ID: {diet.id_dieta}
      </p>

      {/* Mostramos el programa al que pertenece la dieta. */}
      <p className="text-sm text-content">
        Programa: {diet.programa}
      </p>

    

      {/* Mostramos la fecha en que se creó la dieta. */}
      <p className="text-sm text-content-muted">
        Fecha de creación: {diet.fecha_creacion}
      </p>

     {/* El botón queda al final de la tarjeta. */}
      <div className="mt-auto pt-2">
        <Button
          variant="health"
          onClick={verDetalles}
          className="w-full"
        >
          Ver detalles
        </Button>
      </div>
    </Card>
  );
};