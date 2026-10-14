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
