import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  role: null,
  loading: false,

  setUser: (user) => set({ user }),

  setRole: (role) => set({ role }),

  setLoading: (loading) => set({ loading }),

  logout: () =>
    set({
      user: null,
      role: null,
    }),
}));

export default useAuthStore;