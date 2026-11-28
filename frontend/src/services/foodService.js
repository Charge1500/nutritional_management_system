
import {
  alimentos,
  recetasPlatosCompuestos,
} from "../data/mockData";

// Obtener todos los alimentos registrados.
export const obtenerAlimentos = () => {
  return alimentos;
};

// Obtener un alimento por su identificador.
export const obtenerAlimentoPorId = (idAlimento) => {
  return alimentos.find(
    (alimento) =>
      alimento.id_alimento === Number(idAlimento)
  );
};

// Obtener los ingredientes de un plato compuesto.
export const obtenerIngredientesDeAlimento = (idAlimento) => {
  const relaciones = recetasPlatosCompuestos.filter(
    (receta) =>
      receta.id_alimento_compuesto === Number(idAlimento)
  );

  return relaciones
    .map((receta) => {
      const ingrediente = obtenerAlimentoPorId(
        receta.id_alimento_ingrediente
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
