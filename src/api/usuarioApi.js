import axiosInstance from "./axiosInstance";

const API_USUARIOS = "/usuarios";

export const usuarioApi = {
  // Listar todos los usuarios
  getUsuarios: () => axiosInstance.get(API_USUARIOS),

  // Crear un nuevo usuario (admin o cliente)
  crearUsuario: (data) => axiosInstance.post(API_USUARIOS, data),

  // Desactivar un usuario (Soft Delete)
  eliminarUsuario: (id) => axiosInstance.delete(`${API_USUARIOS}/${id}`),
};
