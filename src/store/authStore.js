import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setLogin: (user, token) => set({ user, token, isAuthenticated: true }),
      setLogout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'emsi-auth' }
  )
);