import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response, 
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/');

    if (!isAuthRequest && error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        const setLogout = useAuthStore.getState().setLogout;
        setLogout(); 
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'; 
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;