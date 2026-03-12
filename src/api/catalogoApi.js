import axiosInstance from "./axiosInstance";

const API_CAUSAS = "/catalogos/causas";
const API_TIPOS = "/catalogos/tipos";

export const catalogoApi = {
  //----- CAUSAS -----
  getCausas: () => axiosInstance.get(API_CAUSAS),
  crearCausas: (data) => axiosInstance.post(API_CAUSAS, data),
  actualizarCausa: (id, data) => axiosInstance.put(`${API_CAUSAS}/${id}`, data),
  eliminarCausa: (id) => axiosInstance.delete(`${API_CAUSAS}/${id}`),

  // --- TIPOS DE COMPORTAMIENTO ---
  getTipos: () => axiosInstance.get(API_TIPOS),
  crearTipo: (data) => axiosInstance.post(API_TIPOS, data),
  actualizarTipo: (id, data) => axiosInstance.put(`${API_TIPOS}/${id}`, data),
  eliminarTipo: (id) => axiosInstance.delete(`${API_TIPOS}/${id}`),
};
