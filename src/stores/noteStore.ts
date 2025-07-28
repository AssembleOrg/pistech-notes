import { create } from 'zustand';
import type { Note } from '../types';
import { apiService } from '../services/apiService';

interface NoteStore {
  notes: Note[];
  isLoading: boolean;
  error?: string;
  hasLoaded: boolean;

  setNotes: (list: Note[]) => void;
  clear: () => void;
  loadNotes: () => Promise<void>;
  reloadNotes: () => Promise<void>;
  loadNotesPaginated: (filters?: any) => Promise<{ data: Note[]; total: number }>;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Promise<Note>;
  updateNote: (id: string, note: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  hardDeleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<Note>;
  getNote: (id: string) => Promise<Note>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  isLoading: false,
  error: undefined,
  hasLoaded: false,

  setNotes: (list) => set({ notes: list }),
  clear: () => set({ notes: [], hasLoaded: false }),

  loadNotes: async () => {
    // de-dup: evita cargas simultáneas o repetidas
    if (get().isLoading || get().hasLoaded) return;

    set({ isLoading: true, error: undefined });
    try {
      const data = await apiService.getNotes();
      set({ notes: data, hasLoaded: true });
    } catch (err: any) {
      set({ error: err?.message ?? 'Error cargando notas' });
    } finally {
      set({ isLoading: false });
    }
  },

  reloadNotes: async () => {
    console.log('Reloading notes...');
    set({ isLoading: true, error: undefined, hasLoaded: false });
    try {
      const data = await apiService.getNotes();
      console.log('Notes loaded:', data.length);
      set({ notes: data, hasLoaded: true });
    } catch (err: any) {
      console.error('Error loading notes:', err);
      set({ error: err?.message ?? 'Error cargando notas' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadNotesPaginated: async (filters = {}) => {
    set({ isLoading: true, error: undefined });
    try {
      const response = await apiService.getNotesPaginated(filters);
      set({ notes: response.data, hasLoaded: true });
      return { data: response.data, total: response.total };
    } catch (err: any) {
      set({ error: err?.message ?? 'Error cargando notas' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  createNote: async (note) => {
    set({ isLoading: true, error: undefined });
    try {
      const createdNote = await apiService.createNote(note);
      // Add to current list
      set((state) => ({ 
        notes: [...state.notes, createdNote],
        isLoading: false 
      }));
      return createdNote;
    } catch (err: any) {
      set({ error: err?.message ?? 'Error creando nota', isLoading: false });
      throw err;
    }
  },

  updateNote: async (id, note) => {
    set({ isLoading: true, error: undefined });
    try {
      const updatedNote = await apiService.updateNote(id, note);
      // Update in current list
      set((state) => ({ 
        notes: state.notes.map(n => n.id === id ? updatedNote : n),
        isLoading: false 
      }));
      return updatedNote;
    } catch (err: any) {
      set({ error: err?.message ?? 'Error actualizando nota', isLoading: false });
      throw err;
    }
  },

  deleteNote: async (id) => {
    set({ isLoading: true, error: undefined });
    try {
      await apiService.deleteNote(id);
      // Remove from current list
      set((state) => ({ 
        notes: state.notes.filter(n => n.id !== id),
        isLoading: false 
      }));
    } catch (err: any) {
      set({ error: err?.message ?? 'Error eliminando nota', isLoading: false });
      throw err;
    }
  },

  hardDeleteNote: async (id) => {
    set({ isLoading: true, error: undefined });
    try {
      await apiService.hardDeleteNote(id);
      // Remove from current list
      set((state) => ({ 
        notes: state.notes.filter(n => n.id !== id),
        isLoading: false 
      }));
    } catch (err: any) {
      set({ error: err?.message ?? 'Error eliminando nota permanentemente', isLoading: false });
      throw err;
    }
  },

  restoreNote: async (id) => {
    set({ isLoading: true, error: undefined });
    try {
      const restoredNote = await apiService.restoreNote(id);
      // Update in current list
      set((state) => ({ 
        notes: state.notes.map(n => n.id === id ? restoredNote : n),
        isLoading: false 
      }));
      return restoredNote;
    } catch (err: any) {
      set({ error: err?.message ?? 'Error restaurando nota', isLoading: false });
      throw err;
    }
  },

  getNote: async (id) => {
    set({ isLoading: true, error: undefined });
    try {
      const note = await apiService.getNote(id);
      set({ isLoading: false });
      return note;
    } catch (err: any) {
      set({ error: err?.message ?? 'Error obteniendo nota', isLoading: false });
      throw err;
    }
  },
})); 