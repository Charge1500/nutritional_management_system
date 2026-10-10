import { dietas, atiende } from "../data/mockData";

// Obtiene las dietas autorizadas asociadas a un usuario.
// Recibe como parámetro el identificador del usuario.
export const obtenerDietasAutorizadas = (idUsuario) => {

  // Filtramos las relaciones de la estructura "atiende"
  // para conservar únicamente las que pertenecen al usuario indicado.
  const idsDietas = atiende
    .filter((relacion) => relacion.id_usuario === idUsuario)

    // De cada relación obtenemos solamente el identificador de la dieta.
    // El resultado es un array con los IDs de las dietas asociadas al usuario.
    .map((relacion) => relacion.id_dieta);

  // Recorremos las dietas disponibles y conservamos aquellas cuyo ID
  // aparece en el array de identificadores obtenido anteriormente.
  // Así obtenemos las dietas relacionadas con el usuario.
  return dietas.filter((dieta) =>
    idsDietas.includes(dieta.id_dieta)
  );
};