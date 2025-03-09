import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        // TODO: Zaimplementować prawdziwą integrację z API
        if (username === 'adminmarek' && password === 'tabel0wehasl0') {
          set({
            user: {
              id: '1',
              username: 'adminmarek',
              email: 'admin@example.com'
            },
            isAuthenticated: true
          });
        } else {
          throw new Error('Nieprawidłowe dane logowania');
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
); 