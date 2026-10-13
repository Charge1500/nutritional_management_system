
import {
  alimentos,
  gruposNutricionales,
  alimentosGruposNutricionales,
} from "../data/mockData";

// Obtener todos los alimentos registrados.
export const obtenerAlimentos = () => {
  return alimentos;
};

// Obtener un alimento por su identificador.
export const obtenerAlimentoPorId = (idAlimento) => {
  return alimentos.find(
    (alimento) => alimento.id_alimento === Number(idAlimento)
  );
};

// Obtener todos los grupos nutricionales disponibles.
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

// Obtener los grupos nutricionales relacionados con un alimento.
export const obtenerGruposDeAlimento = (idAlimento) => {
  const relaciones = alimentosGruposNutricionales.filter(
    (relacion) =>
      relacion.id_alimento === Number(idAlimento)
  );

  return relaciones
    .map((relacion) => obtenerGrupoPorId(relacion.id_grupo_nutricional))
    .filter(Boolean);
};


