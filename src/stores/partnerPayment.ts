import { create } from 'zustand';
import type { PartnerPayment } from '../types';
import { apiService } from '../services/apiService';

interface PartnerPaymentStore {
  partnerPayments: PartnerPayment[];
  isLoading: boolean;
  error?: string;
  hasLoaded: boolean;

  setPartnerPayments: (list: PartnerPayment[]) => void;
  clear: () => void;
  loadPartnerPayments: () => Promise<void>;
  reloadPartnerPayments: () => Promise<void>;
  getPartnerPayments: () => Promise<PartnerPayment[]>;
  createPartnerPayment: (payment: Omit<PartnerPayment, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Promise<PartnerPayment>;
  updatePartnerPayment: (id: string, payment: Partial<PartnerPayment>) => Promise<PartnerPayment>;
  deletePartnerPayment: (id: string) => Promise<void>;
  restorePartnerPayment: (id: string) => Promise<PartnerPayment>;
}

export const usePartnerPaymentStore = create<PartnerPaymentStore>((set, get) => ({
  partnerPayments: [],
  isLoading: false,
  error: undefined,
  hasLoaded: false,

  setPartnerPayments: (list) => set({ partnerPayments: list }),
  clear: () => set({ partnerPayments: [], hasLoaded: false }),

  loadPartnerPayments: async () => {
    // de-dup: evita cargas simultáneas o repetidas
    if (get().isLoading || get().hasLoaded) return;

    set({ isLoading: true, error: undefined });
    try {
      const data = await apiService.getPartnerPayments();
      set({ partnerPayments: data, hasLoaded: true });
    } catch (err: any) {
      set({ error: err?.message ?? 'Error cargando pagos' });
    } finally {
      set({ isLoading: false });
    }
  },

  reloadPartnerPayments: async () => {
    console.log('Reloading partner payments...');
    set({ isLoading: true, error: undefined, hasLoaded: false });
    try {
      const data = await apiService.getPartnerPayments();
      console.log('Partner payments loaded:', data.length);
      set({ partnerPayments: data, hasLoaded: true });
    } catch (err: any) {
      console.error('Error loading partner payments:', err);
      set({ error: err?.message ?? 'Error cargando pagos' });
    } finally {
      set({ isLoading: false });
    }
  },

  getPartnerPayments: async () => {
    if (get().isLoading || get().hasLoaded) return get().partnerPayments;
    set({ isLoading: true, error: undefined });
    try {
      const data = await apiService.getPartnerPayments();
      set({ partnerPayments: data, hasLoaded: true, isLoading: false });
    } catch (err: any) {
      console.error('Error loading partner payments:', err);
      set({ error: err?.message ?? 'Error cargando pagos' });
    } finally {
      set({ isLoading: false });
    }
    return get().partnerPayments;
  },

  createPartnerPayment: async (payment) => {
    set({ isLoading: true, error: undefined });
    try {
      const createdPayment = await apiService.createPartnerPayment(payment);
      // Add to current list
      set((state) => ({ 
        partnerPayments: [...state.partnerPayments, createdPayment],
        isLoading: false 
      }));
      return createdPayment;
    } catch (err: any) {
      set({ error: err?.message ?? 'Error creando pago', isLoading: false });
      throw err;
    }
  },

  updatePartnerPayment: async (id, payment) => {
    set({ isLoading: true, error: undefined });
    try {
      const updatedPayment = await apiService.updatePartnerPayment(id, payment);
      
      // Update in current list
      set((state) => {
        const updatedPayments = state.partnerPayments.map(p => p.id === id ? updatedPayment : p);
        console.log('Updated payments:', updatedPayments);
        return { 
          partnerPayments: updatedPayments,
          isLoading: false 
        };
      });
      
      return updatedPayment;
    } catch (err: any) {
      set({ error: err?.message ?? 'Error actualizando pago', isLoading: false });
      throw err;
    }
  },
  

  deletePartnerPayment: async (id) => {
    set({ isLoading: true, error: undefined });
    try {
      await apiService.deletePartnerPayment(id);
      // Remove from current list
      set((state) => ({ 
        partnerPayments: state.partnerPayments.filter(p => p.id !== id),
        isLoading: false 
      }));
    } catch (err: any) {
      set({ error: err?.message ?? 'Error eliminando pago', isLoading: false });
      throw err;
    }
  },

  restorePartnerPayment: async (id) => {
    set({ isLoading: true, error: undefined });
    try {
      const restoredPayment = await apiService.restorePartnerPayment(id);
      // Update in current list
      set((state) => ({ 
        partnerPayments: state.partnerPayments.map(p => p.id === id ? restoredPayment : p),
        isLoading: false 
      }));
      return restoredPayment;
    } catch (err: any) {
      set({ error: err?.message ?? 'Error restaurando pago', isLoading: false });
      throw err;
    }
  },
}));
