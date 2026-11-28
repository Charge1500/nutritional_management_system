import { usuarios } from "../data/mockData";

// Busca un usuario a partir de su identificador.
// Recibe el ID del usuario que queremos encontrar.
export const obtenerUsuarioPorId = (idUsuario) => {

  // Recorremos el array de usuarios y buscamos el primero
  // cuyo identificador coincida con el ID recibido.
  return usuarios.find(
    (usuario) => usuario.id_usuario === idUsuario

  // Si find() no encuentra ningún usuario, devuelve undefined.
  // El operador ?? sustituye ese resultado por null.
  ) ?? null;
};