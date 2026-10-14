import { Card } from "../Card";
import { Button } from "../Button";
import { useNavigate } from "react-router-dom";
import { Badge } from "../Badge";

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

      {/* Encabezado: nombre y estado del alimento */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-content-muted">
            Alimento
          </p>

          <h3 className="mt-1 break-words text-lg font-semibold text-health-700">
            {food.nombre_alimento}
          </h3>
        </div>

        <div className="shrink-0">
          <Badge status={food.estado_alimento} />
        </div>
      </div>

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

     
      

       {/* Mostramos el nivel calorico. */}
      <p className="text-sm text-content">
        Nivel calórico: {food.nivel_calorico}
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