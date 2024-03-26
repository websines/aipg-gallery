import {create} from 'zustand';
import { IApiParams, ParamsObject } from '@/types'; 

// Initial state - Align with transformed input
const initialFormState: IApiParams = {
  prompt: "", 
  params: {
    sampler_name: "k_lms", // Default sampler
    cfg_scale: 7.5, 
    height: 512,
    width: 512,
    seed: "", 
    steps: 16,
    karras: true,
    hires_fix: false,
    clip_skip: 1,
    tiling: false,
    n: 1,
    post_processing: [], 
  },
  nsfw: false,
  censor_nsfw: false,
  trusted_workers: false,
  models: ["Juggernaut XL"], // Or another default
  r2: true,
  replacement_filter: true,
  shared: false,
  slow_workers: true,
  dry_run: false,
};

const useFormInputStore = create((set) => ({
  formData: initialFormState,

  updateFormField: (field: any, value: any) => {
    set((state: any) => ({ formData: { ...state.formData, [field]: value } }));
  },

  updateParamsField: (paramField: any, value: any) => {
    set((state: any) => ({
      formData: {
        ...state.formData,
        params: { ...state.formData.params, [paramField]: value },
      },
    }));
  },

  resetForm: () => set({ formData: initialFormState }),
}));

export default useFormInputStore; 
