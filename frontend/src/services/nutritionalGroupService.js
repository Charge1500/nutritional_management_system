
import {
  alimentos,
  gruposNutricionales,
  alimentosGruposNutricionales,
} from "../data/mockData";

// Obtener todos los grupos nutricionales guardados.
export const obtenerGruposNutricionales = () => {
  return gruposNutricionales.filter(
    (grupo) => grupo.estado_grupo === "guardado"
  );
};

// Obtener un grupo nutricional por su identificador.
export const obtenerGrupoPorId = (idGrupo) => {
  return gruposNutricionales.find(
    (grupo) =>
      grupo.id_grupo_nutricional === Number(idGrupo)
  );
};

// Obtener todos los grupos con la cantidad de alimentos asociados.
export const obtenerGruposConCantidadAlimentos = () => {
  return gruposNutricionales.map((grupo) => {
    const cantidadAlimentos = alimentosGruposNutricionales.filter(
      (relacion) =>
        relacion.id_grupo_nutricional ===
        grupo.id_grupo_nutricional
    ).length;

    return {
      ...grupo,
      cantidadAlimentos,
    };
  });
};

// Obtener los alimentos asociados a un grupo nutricional.
export const obtenerAlimentosDeGrupo = (idGrupo) => {
  const relaciones = alimentosGruposNutricionales.filter(
    (relacion) =>
      relacion.id_grupo_nutricional === Number(idGrupo)
  );

  return relaciones
    .map((relacion) =>
      alimentos.find(
        (alimento) =>
          alimento.id_alimento === relacion.id_alimento
      )
    )
    .filter(Boolean);
};
// Obtener los grupos nutricionales a los que pertenece un alimento.
export const obtenerGruposDeAlimento = (idAlimento) => {
  const relaciones = alimentosGruposNutricionales.filter(
    (relacion) =>
      relacion.id_alimento === Number(idAlimento)
  );

  return relaciones
    .map((relacion) =>
      gruposNutricionales.find(
        (grupo) =>
          grupo.id_grupo_nutricional ===
          relacion.id_grupo_nutricional
      )
    )
    .filter(Boolean);
};