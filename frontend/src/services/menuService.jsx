import {
  menus,
  
} from "../data/mockData";

// Obtener todos los menus registrados.
export const obtenerMenus = () => {
  return menus;
};

// Obtener un menu por su identificador.
export const obtenerMenuPorId = (idMenu) => {
  return menus.find(
    (menu) => menu.id_menu === Number(idMenu)
  );
};
import { ROLES } from "../data/roles";

export const validarMenu = (
  idMenu,
  estado,
  observaciones = null,
  rolUsuario
) => {
  if (rolUsuario !== ROLES.JEFE) {
    return false;
  }

  if (!["aprobado", "rechazado"].includes(estado)) {
    return false;
  }

  if (estado === "rechazado" && !observaciones?.trim()) {
    return false;
  }

  const menu = menus.find(
    (item) => item.id_menu === Number(idMenu)
  );

  if (!menu || menu.estado_menu !== "pendiente") {
    return false;
  }

  menu.estado_menu = estado;
  menu.fecha_validacion = new Date().toISOString().slice(0, 10);
  menu.observaciones =
    estado === "rechazado" ? observaciones.trim() : null;

  return true;
};