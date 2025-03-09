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
  register: (username: string, password: string) => Promise<void>;
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
      register: async (username: string, password: string) => {
        // TODO: Zaimplementować prawdziwą integrację z API
        // Na razie symulujemy rejestrację poprzez automatyczne logowanie
        if (username && password.length >= 6) {
          set({
            user: {
              id: Math.random().toString(36).substr(2, 9),
              username,
              email: `${username}@example.com`
            },
            isAuthenticated: true
          });
        } else {
          throw new Error('Nieprawidłowe dane rejestracji');
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