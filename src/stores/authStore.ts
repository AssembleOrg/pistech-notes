import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/apiService';
import type { User, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
  clearError: () => void;
  setUser: (user: User) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await apiService.login({ email, password });
          
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Set token in apiService for future requests
          apiService.setToken(response.access_token);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        apiService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      validateToken: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false });
          return false;
        }

        try {
          // Set token in apiService
          apiService.setToken(token);
          
          const isValid = await apiService.validateToken(token);
          console.log('validateToken', isValid);
          
          if (isValid) {
            set({ isAuthenticated: true });
            return true;
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 