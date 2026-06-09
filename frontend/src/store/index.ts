
import { create } from 'zustand';
import { setToken } from '../services/api';

interface AppState {
  user: any | null;
  token: string | null;
  procedure: any | null;
  checkins: any[];
  setAuth: (user: any, token: string) => void;
  setProcedure: (p: any) => void;
  addCheckin: (c: any) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  token: null,
  procedure: null,
  checkins: [],

  setAuth: (user, token) => {
    setToken(token);
    set({ user, token });
  },

  setProcedure: (procedure) => set({ procedure }),

  addCheckin: (c) => set((s) => ({ checkins: [...s.checkins, c] })),

  logout: () => {
    setToken(null);
    set({ user: null, token: null, procedure: null, checkins: [] });
  },
}));
