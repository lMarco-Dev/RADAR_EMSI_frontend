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
    const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');

    if (!isLoginRequest && error.response && (error.response.status === 401 || error.response.status === 403)) {
      const setLogout = useAuthStore.getState().setLogout;
      setLogout(); 
      window.location.href = '/login'; 
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;