import { obtenerUsuarioPorId } from "../userService";
import {
  obtenerMenuPorId,
  obtenerAlimentosDeMenu
} from "../menuService";
import {
  obtenerDietaPorId,
  obtenerGruposDeDieta,
} from "../dietService";
import {
  obtenerGruposDeAlimento,
} from "../nutritionalGroupService";

export const obtenerDetallesMenu = (idMenu) => {
  // 1. Obtener el menú.
  const menu = obtenerMenuPorId(idMenu);

  // Si no existe, no tiene sentido continuar.
  if (!menu) return null;

  // 2. Obtener el nutricionista que creó el menú.
  const creador = obtenerUsuarioPorId(
    menu.id_usuario_creador
  );

  // 3. Obtener la dieta asociada.
  const dieta = obtenerDietaPorId(menu.id_dieta);

  // 4. Obtener los grupos nutricionales de esa dieta.
  const grupos = dieta
    ? obtenerGruposDeDieta(dieta.id_dieta)
    : [];

  // 5. Obtener los alimentos del menú y sus grupos.
  const alimentos = obtenerAlimentosDeMenu(menu.id_menu).map(
    (alimento) => ({
      ...alimento,
      grupos: obtenerGruposDeAlimento(alimento.id_alimento),
    })
  );
  

  // Devolver todos los datos organizados.
  return {
    menu,
    creador,
    dieta,
    grupos,
    alimentos,
  };
};