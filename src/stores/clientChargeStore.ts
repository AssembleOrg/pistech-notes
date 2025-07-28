import { create } from 'zustand';
import type { ClientCharge } from '../types';
import { apiService } from '../services/apiService';

interface ClientChargeStore {
  clientCharges: ClientCharge[];
  isLoading: boolean;
  error?: string;
  hasLoaded: boolean;

  setClientCharges: (list: ClientCharge[]) => void;
  clear: () => void;
  loadClientCharges: () => Promise<void>;
  reloadClientCharges: () => Promise<void>;
  createClientCharge: (charge: Omit<ClientCharge, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Promise<ClientCharge>;
  updateClientCharge: (id: string, charge: Partial<ClientCharge>) => Promise<ClientCharge>;
  deleteClientCharge: (id: string) => Promise<void>;
  restoreClientCharge: (id: string) => Promise<ClientCharge>;
}

export const useClientChargeStore = create<ClientChargeStore>((set, get) => ({
  clientCharges: [],
  isLoading: false,
  error: undefined,
  hasLoaded: false,

  setClientCharges: (list) => set({ clientCharges: list }),
  clear: () => set({ clientCharges: [], hasLoaded: false }),

  loadClientCharges: async () => {
    // de-dup: evita cargas simultáneas o repetidas
    if (get().isLoading || get().hasLoaded) return;

    set({ isLoading: true, error: undefined });
    try {
      const data = await apiService.getClientCharges();
      set({ clientCharges: data, hasLoaded: true });
    } catch (err: any) {
      set({ error: err?.message ?? 'Error cargando cobros' });
    } finally {
      set({ isLoading: false });
    }
  },

  reloadClientCharges: async () => {
    console.log('Reloading client charges...');
    set({ isLoading: true, error: undefined, hasLoaded: false });
    try {
      const data = await apiService.getClientCharges();
      console.log('Client charges loaded:', data.length);
      set({ clientCharges: data, hasLoaded: true });
    } catch (err: any) {
      console.error('Error loading client charges:', err);
      set({ error: err?.message ?? 'Error cargando cobros' });
    } finally {
      set({ isLoading: false });
    }
  },

  createClientCharge: async (charge) => {
    set({ isLoading: true, error: undefined });
    try {
      const createdCharge = await apiService.createClientCharge(charge);
      set((state) => ({ 
        clientCharges: [...state.clientCharges, createdCharge],
        isLoading: false 
      }));
      return createdCharge;
    } catch (err: any) {
      set({ error: err?.message ?? 'Error creando cobro', isLoading: false });
      throw err;
    }
  },

  updateClientCharge: async (id, charge) => {
    set({ isLoading: true, error: undefined });
    try {
      const updatedCharge = await apiService.updateClientCharge(id, charge);
      set((state) => ({ 
        clientCharges: state.clientCharges.map(c => c.id === id ? updatedCharge : c),
        isLoading: false 
      }));
      return updatedCharge;
    } catch (err: any) {
      set({ error: err?.message ?? 'Error actualizando cobro', isLoading: false });
      throw err;
    }
  },

  deleteClientCharge: async (id) => {
    set({ isLoading: true, error: undefined });
    try {
      await apiService.deleteClientCharge(id);
      set((state) => ({ 
        clientCharges: state.clientCharges.filter(c => c.id !== id),
        isLoading: false 
      }));
    } catch (err: any) {
      set({ error: err?.message ?? 'Error eliminando cobro', isLoading: false });
      throw err;
    }
  },

  restoreClientCharge: async (id) => {
    set({ isLoading: true, error: undefined });
    try {
      const restoredCharge = await apiService.restoreClientCharge(id);
      set((state) => ({ 
        clientCharges: state.clientCharges.map(c => c.id === id ? restoredCharge : c),
        isLoading: false 
      }));
      return restoredCharge;
    } catch (err: any) {
      set({ error: err?.message ?? 'Error restaurando cobro', isLoading: false });
      throw err;
    }
  },
})); 