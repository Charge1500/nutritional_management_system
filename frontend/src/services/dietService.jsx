import {
  dietas,
  atiende,
  gruposNutricionales,
  coberturaDietaGrupo,
  alimentos,
  restriccionesDietaAlimento
} from "../data/mockData";



// Obtiene todas las dietas para la gestión del jefe.
export const obtenerTodasLasDietas = () => {
  return dietas;
};

// Obtiene una dieta por su identificador.
export const obtenerDietaPorId = (idDieta) => {
  return dietas.find(
    (dieta) => dieta.id_dieta === Number(idDieta)
  );
};

// Obtiene las dietas guardadas y asignadas al nutricionista.
export const obtenerDietasAutorizadas = (idUsuario) => {
  const idsDietas = atiende
    .filter((relacion) => relacion.id_usuario === Number(idUsuario))
    .map((relacion) => relacion.id_dieta);

  return dietas.filter(
    (dieta) =>
      idsDietas.includes(dieta.id_dieta) &&
      dieta.estado_dieta === "guardado"
  );
};



/**
 * Obtiene los grupos nutricionales que debe cubrir una dieta.
 */
export const obtenerGruposDeDieta = (idDieta) => {
  // Buscamos las relaciones correspondientes a la dieta.
  const relaciones = coberturaDietaGrupo.filter(
    (relacion) => relacion.id_dieta === Number(idDieta)
  );

  // Obtenemos los datos completos de cada grupo nutricional.
  return relaciones
    .map((relacion) =>
      gruposNutricionales.find(
        (grupo) =>
          grupo.id_grupo_nutricional === relacion.id_grupo_nutricional
      )
    )
    .filter(Boolean);
};


export const obtenerRestriccionesDeDieta = (idDieta) => {
  return restriccionesDietaAlimento
    .filter(
      (restriccion) =>
        restriccion.id_dieta === Number(idDieta)
    )
    .map((restriccion) => {
      const alimento = alimentos.find(
        (alimento) =>
          alimento.id_alimento === restriccion.id_alimento
      );

      return {
        ...restriccion,
        alimento,
      };
    })
    .filter((restriccion) => restriccion.alimento);
};

