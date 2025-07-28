import { create } from 'zustand';
import type { Partner } from '../types';
import { apiService } from '../services/apiService';

interface PartnerStore {
  partners: Partner[];
  isLoading: boolean;
  error?: string;
  hasLoaded: boolean;

  setPartners: (partners: Partner[]) => void;
  clear: () => void;
  loadPartners: () => Promise<void>;
  reloadPartners: () => Promise<void>;
  getPartnerById: (id: string) => Partner | undefined;
}

export const usePartnerStore = create<PartnerStore>((set,get) => ({
  partners: [],
  isLoading: false,
  error: undefined,
  hasLoaded: false,

  setPartners: (partners) => set({ partners }),
  clear: () => set({ partners: [], hasLoaded: false }),

  getPartners: async () => {
    if (get().isLoading || get().hasLoaded) return;
    set({ isLoading: true, error: undefined });
    try {
      const data = await apiService.getPartners();
      set({ partners: data, hasLoaded: true });
    } catch (err: any) {
      set({ error: err?.message ?? 'Error cargando socios' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadPartners: async () => {
    if (get().isLoading || get().hasLoaded) return;
    set({ isLoading: true, error: undefined });
    try {
      const data = await apiService.getPartners();
      set({ partners: data, hasLoaded: true });
    } catch (err: any) {
      set({ error: err?.message ?? 'Error cargando socios' });
    } finally {
      set({ isLoading: false });
    }
  },
  getPartnerById: (id: string) => {
    return get().partners.find(p => p.id === id);
  },
  reloadPartners: async () => {
    console.log('Reloading partners...');
    set({ isLoading: true, error: undefined, hasLoaded: false });
    try {
      const data = await apiService.getPartners();
      console.log('Partners loaded:', data.length);
      set({ partners: data, hasLoaded: true });
    } catch (err: any) {
      set({ error: err?.message ?? 'Error cargando socios' });
    } finally {
      set({ isLoading: false });
    }
  }
}));