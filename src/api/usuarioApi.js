import axiosInstance from "./axiosInstance";

const API_USUARIOS = "/usuarios";

export const usuarioApi = {
  getUsuarios: () => axiosInstance.get(API_USUARIOS),

  crearUsuario: (data) => axiosInstance.post(API_USUARIOS, data),

  actualizarUsuario: (id, data) => axiosInstance.put(`${API_USUARIOS}/${id}`, data),

  eliminarUsuario: (id) => axiosInstance.delete(`${API_USUARIOS}/${id}`),
};