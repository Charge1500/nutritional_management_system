
import { useNavigate } from "react-router-dom";
import { Card } from "../Card";
import { Button } from "../Button";
import { Badge } from "../Badge";

// Tarjeta que muestra un resumen de un menú nutricional.
export const MenuCard = ({ menu }) => {
  const navigate = useNavigate();

  // Navega a la página de detalles del menú seleccionado.
  const verDetalles = () => {
    navigate(`/nutricionista/menus/${menu.id_menu}`);
  };

  
  return (
    <Card className="flex h-full flex-col gap-4 transition-shadow duration-200 hover:shadow-md">
      
 {/* Encabezado del menú */}
<div className="flex items-start justify-between gap-3">
  <div className="min-w-0 flex-1">
    <p className="text-xs font-medium uppercase tracking-wider text-content-muted">
      Menú nutricional
    </p>

    <h3 className="mt-1 break-words text-xl font-bold text-health-700">
      {menu.nombre_menu}
    </h3>
  </div>

  {/* ID y estado en la esquina superior derecha */}
  <div className="flex shrink-0 flex-col items-end gap-2">
    <span className="text-xs text-content-muted">
      #{menu.id_menu}
    </span>

    <Badge status={menu.estado_menu} />
  </div>
</div>

      {/* Acción principal */}
      <div className="mt-auto border-t border-gray-100 pt-4">
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
