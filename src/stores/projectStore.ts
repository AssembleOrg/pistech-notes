import { create } from 'zustand';
import type { Project } from '../types';
import { apiService } from '../services/apiService';

interface ProjectStore {
  projects: Project[];
  isLoading: boolean;   
  error?: string;
  hasLoaded: boolean;

  setProjects: (projects: Project[]) => void;
  clear: () => void;
  loadProjects: () => Promise<void>;
  reloadProjects: () => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set,get) => ({
    projects: [],
    isLoading: false,
    error: undefined,
    hasLoaded: false,

    setProjects: (projects: Project[]) => set({ projects }),
    clear: () => set({ projects: [], hasLoaded: false }),

    loadProjects: async () => {
        if (get().isLoading || get().hasLoaded) return;
        set({ isLoading: true, error: undefined });
        try {
            const data = await apiService.getProjects();
            set({ projects: data, hasLoaded: true });
        } catch (err: any) {
            set({ error: err?.message ?? 'Error cargando proyectos' });
        } finally {
            set({ isLoading: false });
        }
    },
    reloadProjects: async () => {
        console.log('Reloading projects...');
        set({ isLoading: true, error: undefined, hasLoaded: false });
        try {
            const data = await apiService.getProjects();
            console.log('Projects loaded:', data.length);
            set({ projects: data, hasLoaded: true });
        } catch (err: any) {
            set({ error: err?.message ?? 'Error cargando proyectos' });
        } finally {
            set({ isLoading: false });
        }
    }
}));