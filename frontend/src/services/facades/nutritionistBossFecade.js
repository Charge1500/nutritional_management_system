
import {
  obtenerMenus,
} from "../menuService";

import {
  obtenerTodasLasDietas,
  obtenerDietaPorId,
  obtenerGruposDeDieta,
  obtenerRestriccionesDeDieta,
  obtenerMenusDeDieta,
} from "../dietService";

import {
  obtenerAlimentos,
} from "../foodService";
import { obtenerGruposNutricionales } from "../nutritionalGroupService";

// ===============================
// Información general
// ===============================

export const obtenerResumenJefeNutricion = () => {
  const menus = obtenerMenus();
  const dietas = obtenerTodasLasDietas();
  const grupos = obtenerGruposNutricionales();
  const alimentos = obtenerAlimentos();

  const pendientes = menus.filter(
    (menu) => menu.estado_menu === "pendiente"
  );

  const aprobados = menus.filter(
    (menu) => menu.estado_menu === "aprobado"
  );

  const rechazados = menus.filter(
    (menu) => menu.estado_menu === "rechazado"
  );

  return {
    menus,
    dietas,
    grupos,
    alimentos,
    pendientes,
    aprobados,
    rechazados,
  };
};

// ===============================
// Gestión de dietas
// ===============================

export const obtenerDatosFormularioDieta = (idDieta) => {
  const dieta = obtenerDietaPorId(Number(idDieta));

  if (!dieta) {
    return null;
  }

  return {
    dieta,
    menusAsociados: obtenerMenusDeDieta(Number(idDieta)),
    grupos: obtenerGruposDeDieta(Number(idDieta)),
    restricciones: obtenerRestriccionesDeDieta(Number(idDieta)),
    gruposDisponibles: obtenerGruposNutricionales(),
    alimentosDisponibles: obtenerAlimentos(),
  };
};

// ===============================
// Datos para crear una dieta
// ===============================

export const obtenerDatosNuevaDieta = () => {
  return {
    gruposDisponibles: obtenerGruposNutricionales(),
    alimentosDisponibles: obtenerAlimentos(),
  };
};
