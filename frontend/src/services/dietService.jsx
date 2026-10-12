import {
  dietas,
  atiende,
  gruposNutricionales,
  coberturaDietaGrupo,
  restriccionesGrupoAlimento,
  alimentos,
} from "../data/mockData";

// Obtiene las dietas autorizadas asociadas a un usuario.
// Recibe como parámetro el identificador del usuario.
export const obtenerDietasAutorizadas = (idUsuario) => {

 
  const idsDietas = atiende
    .filter((relacion) => relacion.id_usuario === idUsuario)
    .map((relacion) => relacion.id_dieta);
  return dietas.filter((dieta) =>
    idsDietas.includes(dieta.id_dieta)
  );
};


/**
 * Obtiene una dieta específica por su identificador.
 * Devuelve la dieta encontrada o undefined si no existe.
 */
export const obtenerDietaPorId = (idDieta) => {
  return dietas.find(
    (dieta) => dieta.id_dieta === Number(idDieta)
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

  // Obtenemos los datos completos de cada grupo.
  return relaciones
    .map((relacion) =>
      gruposNutricionales.find(
        (grupo) => grupo.id_grupo === relacion.id_grupo
      )
    )
    .filter(Boolean);
};

/**
 * Obtiene las restricciones asociadas a los grupos
 * nutricionales que cubre una dieta.
 */
export const obtenerRestriccionesDeDieta = (idDieta) => {
  // Primero obtenemos los grupos cubiertos por la dieta.
  const grupos = obtenerGruposDeDieta(idDieta);

  // Guardamos sus identificadores.
  const idsGrupos = grupos.map((grupo) => grupo.id_grupo);

  // Buscamos las restricciones que pertenecen a esos grupos.
  return restriccionesGrupoAlimento
    .filter((restriccion) =>
      idsGrupos.includes(restriccion.id_grupo)
    )
    .map((restriccion) => ({
      ...restriccion,
      grupo: grupos.find(
        (grupo) => grupo.id_grupo === restriccion.id_grupo
      ),
      alimento: alimentos.find(
        (alimento) =>
          alimento.id_alimento === restriccion.id_alimento
      ),
    }));
};

