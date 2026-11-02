
import { menus } from "../data/mockData";
import { ROLES } from "../data/roles";

// Obtener todos los menús registrados.
export const obtenerMenus = () => {
  return menus;
};

// Obtener un menú por su identificador.
export const obtenerMenuPorId = (idMenu) => {
  return menus.find(
    (menu) => menu.id_menu === Number(idMenu)
  );
};

// Obtener los menús pendientes de aprobación.
export const obtenerMenusPendientes = () => {
  return menus.filter(
    (menu) => menu.estado_menu === "pendiente"
  );
};

// Validar un menú. Solo el jefe puede aprobarlo o rechazarlo.
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

  if (
    estado === "rechazado" &&
    !observaciones?.trim()
  ) {
    return false;
  }

  const menu = obtenerMenuPorId(idMenu);

  if (!menu || menu.estado_menu !== "pendiente") {
    return false;
  }

  menu.estado_menu = estado;
  menu.fecha_validacion = new Date()
    .toISOString()
    .slice(0, 10);

  menu.observaciones =
    estado === "rechazado"
      ? observaciones.trim()
      : null;

  return true;
};
