import fetchAvailableModels  from '@/app/_api/fetchModels'
import {create} from 'zustand'

interface ModelStoreState{
    models: Model[] | [], 
    models_loading: boolean,
    error: {} | null,
    fetchModels: () => void
    
}

export const ModelStore = create<ModelStoreState>((set) => ({
    models: [] as Model[],
    models_loading: false,
    error: null,
    fetchModels: async () => {
        set({ models_loading: true, error: null });
        try {
          const response = await fetchAvailableModels();
          set({ models: response, models_loading: false });
        } catch (err) {
          set({ models_loading: false, error: err });
          console.error('Error fetching models:', err);
        }
      }
  }));