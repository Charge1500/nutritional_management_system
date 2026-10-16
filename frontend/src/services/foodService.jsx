
import {
  alimentos,
  gruposNutricionales,
  alimentosGruposNutricionales,
  recetasPlatosCompuestos
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

// Obtener los ingredientes de un plato compuesto.
export const obtenerIngredientesDeAlimento = (idAlimento) => {
  const relaciones = recetasPlatosCompuestos.filter(
    (receta) =>
      receta.id_alimento_compuesto === Number(idAlimento)
  );

  return relaciones
    .map((receta) => {
      const ingrediente = alimentos.find(
        (alimento) =>
          alimento.id_alimento === receta.id_alimento_ingrediente
      );

      if (!ingrediente) return null;

      return {
        ...ingrediente,
        cantidad: receta.cantidad,
        unidad_medida: receta.unidad_medida,
      };
    })
    .filter(Boolean);
};
