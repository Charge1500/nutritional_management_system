// src/components/patient/MenuCard.jsx
import { Card } from "../Card";
import { Button } from "../Button";
import { useNavigate } from "react-router-dom";
import { obtenerAlimentosDeMenu } from "../../services/menuService";

// Componente que representa un menú asignado al paciente.
// Recibe la asignación (con menú y dieta ya enriquecidos) como prop.
export const MenuCard = ({ asignacion }) => {
  const navigate = useNavigate();

  // Desestructuramos los datos de la asignación.
  // OJO: el mock nuevo usa `estado_asignacion` en vez de `completado`.
  const { id_asignacion, menu, dieta, fecha_asignacion, estado_asignacion } =
    asignacion;

  // Si por alguna razón no hay menú asociado, mostramos un aviso.
  if (!menu) {
    return (
      <Card className="space-y-4">
        <p className="text-sm text-content-muted">Menú no encontrado.</p>
      </Card>
    );
  }

  // Obtenemos los alimentos que componen el menú.
  const alimentosDelMenu = obtenerAlimentosDeMenu(menu.id_menu);

  // Determinamos si el menú ya fue consumido.
  const estaConsumido = estado_asignacion === "consumido";

  // Navega a la pantalla de registro de consumo con el id de la asignación.
  const registrarConsumo = () => {
    navigate(`/paciente/consumo?idAsignacion=${id_asignacion}`);

  };

  return (
    <Card className="space-y-4">
      {/* Cabecera: nombre del menú y estado */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-content">
            {menu.nombre_menu}
          </h3>

          {dieta && (
            <p className="mt-1 text-sm text-content-muted">
              {dieta.nombre_dieta}
            </p>
          )}
        </div>

        {/* Etiqueta de estado (consumido / pendiente) */}
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            estaConsumido
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {estaConsumido ? "Consumido" : "Pendiente"}
        </span>
      </div>

      {/* Alimentos del menú */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-content-muted">
          Alimentos
        </p>

        <ul className="mt-2 space-y-1 text-sm text-content">
          {alimentosDelMenu.map((alimento) => (
            <li key={alimento.id_alimento}>
              · {alimento.nombre_alimento}
              {alimento.cantidad && (
                <span className="text-content-muted">
                  {" "}
                  ({alimento.cantidad} {alimento.unidad_medida})
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Fecha de asignación */}
      <p className="text-sm text-content-muted">
        Asignado el {fecha_asignacion}
      </p>

      {/* Botón de acción */}
      <div className="mt-auto pt-2">
        <Button
          variant="health"
          onClick={registrarConsumo}
          className="w-full"
          disabled={estaConsumido}
        >
          {estaConsumido ? "Ya consumido" : "Registrar consumo"}
        </Button>
      </div>
    </Card>
  );
};