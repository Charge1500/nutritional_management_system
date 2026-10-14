import { Card } from "../Card";
import { Button } from "../Button";
import { useNavigate } from "react-router-dom";

// Componente que representa una tarjeta con la información de un alimento.
export const FoodCard = ({ food }) => {

  // Permite navegar a otra ruta de la aplicación.
  const navigate = useNavigate();

  // Abre la página de detalles del alimento seleccionado.
  const verDetalles = () => {
    navigate(`/nutricionista/alimentos/${food.id_alimento}`);
  };

  return (
    // Reutilizamos Card para mantener el diseño común de las tarjetas.
    <Card className="flex h-full flex-col space-y-4">

      {/* Mostramos el nombre del alimento como título principal. */}
      <h3 className="text-lg font-semibold text-content">
        {food.nombre_alimento}
      </h3>

      {/* Mostramos el identificador del alimento. */}
      <p className="text-sm text-content-muted">
        ID: {food.id_alimento}
      </p>
        {/* Indica si el alimento es simple o compuesto. */}
      <p className="text-sm text-content">
        Tipo de plato:{" "}
        <span className="font-medium">
          {food.tipo_alimento === "compuesto" ? "Compuesto" : "Simple"}
        </span>
      </p>

      {/* Mostramos el tipo de preparación del alimento. */}
      <p className="text-sm text-content">
        Tipo de preparación: {food.tipo_preparacion}
      </p>

     
      {/* Mostramos el estado de validación del alimento. */}
      <p className="text-sm text-content">
        Estado: {food.estado_alimento}
      </p>

       {/* Mostramos el nivel calorico. */}
      <p className="text-sm text-content">
        Nivel calórico,: {food.nivel_calorico}
      </p>

      {/* Mostramos la fecha en que se creó el alimento. */}
      <p className="text-sm text-content-muted">
        Fecha de creación: {food.fecha_creacion}
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