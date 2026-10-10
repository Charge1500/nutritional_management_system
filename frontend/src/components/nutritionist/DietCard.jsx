import { Card } from "../Card";
import { Badge } from "../Badge";
import { Button } from "../Button";

// Componente que representa una tarjeta con la información de una dieta.
// Recibe los datos de la dieta mediante la prop "diet".
export const DietCard = ({ diet }) => {
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

      {/* Mostramos el estado mediante el componente Badge reutilizable. */}
      <div>
        <Badge status={diet.estado} />
      </div>

      {/* Mostramos la fecha en que se creó la dieta. */}
      <p className="text-sm text-content-muted">
        Fecha de creación: {diet.fecha_creacion}
      </p>

      {/* Botón reutilizable para consultar los detalles de la dieta.
          Por ahora no tiene ninguna acción asociada. */}
      <Button variant="primary">
        Ver detalles
      </Button>
    </Card>
  );
};