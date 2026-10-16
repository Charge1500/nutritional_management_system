
import {
  menusAsignados,
  menus,
  contenidoMenuAlimento,
  alimentos,
  consumos,
  dietas,
  inscripcionesPacienteDieta,
  valoraciones,
  usuarios,
} from "../data/mockData";

// Obtiene las dietas en las que está inscrito un paciente.
export const obtenerDietasInscritas = (idPaciente) => {
  // Buscamos las inscripciones del paciente.
  const inscripciones = inscripcionesPacienteDieta.filter(
    (inscripcion) => inscripcion.id_usuario === Number(idPaciente)
  );

  // Obtenemos los datos completos de cada dieta.
  return inscripciones
    .map((inscripcion) =>
      dietas.find((dieta) => dieta.id_dieta === inscripcion.id_dieta)
    )
    .filter(Boolean);
};

// Obtiene los menús asignados a un paciente.
// Enriquece cada asignación con el menú y la dieta correspondientes.
export const obtenerMenusAsignados = (idPaciente) => {
  return menusAsignados
    .filter(
      (asignacion) => asignacion.id_usuario === Number(idPaciente)
    )
    .map((asignacion) => {
      // Buscamos el menú asociado a la asignación.
      const menu = menus.find(
        (menu) => menu.id_menu === asignacion.id_menu
      );

      // Buscamos la dieta a la que pertenece ese menú.
      const dieta = menu
        ? dietas.find((dieta) => dieta.id_dieta === menu.id_dieta)
        : null;

      return { ...asignacion, menu, dieta };
    });
};

// Obtiene los alimentos que componen un menú.
// Enriquece cada alimento con la cantidad y unidad del menú.
export const obtenerAlimentosDeMenu = (idMenu) => {
  // Buscamos las relaciones del menú con sus alimentos.
  const relaciones = contenidoMenuAlimento.filter(
    (relacion) => relacion.id_menu === Number(idMenu)
  );

  // Obtenemos los datos completos de cada alimento,
  // agregando la cantidad y unidad indicadas en el menú.
  return relaciones
    .map((relacion) => {
      const alimento = alimentos.find(
        (alimento) => alimento.id_alimento === relacion.id_alimento
      );

      return alimento
        ? {
            ...alimento,
            cantidad: relacion.cantidad,
            unidad_medida: relacion.unidad_medida,
          }
        : null;
    })
    .filter(Boolean);
};

// Obtiene los consumos registrados por un paciente.
// El mock guarda consumos por asignación (id_asignacion),
// así que primero se obtienen las asignaciones del paciente.
export const obtenerConsumosDePaciente = (idPaciente) => {
  // Buscamos las asignaciones del paciente.
  const asignacionesPaciente = menusAsignados.filter(
    (asignacion) => asignacion.id_usuario === Number(idPaciente)
  );

  // Obtenemos los ids de esas asignaciones.
  const idsAsignaciones = asignacionesPaciente.map(
    (asignacion) => asignacion.id_asignacion
  );

  // Filtramos los consumos que pertenecen a esas asignaciones.
  return consumos
    .filter((consumo) => idsAsignaciones.includes(consumo.id_asignacion))
    .map((consumo) => {
      const asignacion = asignacionesPaciente.find(
        (asignacion) => asignacion.id_asignacion === consumo.id_asignacion
      );

      const menu = asignacion
        ? menus.find((menu) => menu.id_menu === asignacion.id_menu)
        : null;

      return { ...consumo, asignacion, menu };
    })
    .sort(
      (a, b) => new Date(b.fecha_consumo) - new Date(a.fecha_consumo)
    );
};

// Obtiene las valoraciones recibidas por un paciente.
// Enriquece cada valoración con el nutricionista que la emitió.
export const obtenerValoracionesDePaciente = (idPaciente) => {
  return valoraciones
    .filter(
      (valoracion) => valoracion.id_usuario === Number(idPaciente)
    )
    .map((valoracion) => {
      // Buscamos el nutricionista que emitió la valoración.
      const nutricionista = usuarios.find(
        (usuario) =>
          usuario.id_usuario === valoracion.id_usuario_nutricionista
      );

      return { ...valoracion, nutricionista };
    })
    .sort(
      (a, b) => new Date(b.fecha_valoracion) - new Date(a.fecha_valoracion)
    );
};

// Obtiene los nutricionistas disponibles para solicitar una revalorización.
export const obtenerNutricionistas = () => {
  return usuarios.filter((usuario) => usuario.rol === "nutricionista");
};