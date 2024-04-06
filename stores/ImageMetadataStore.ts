import {create} from 'zustand'

type ImageMetaData = {
    positivePrompt: string;
    negativePrompt: string;
    sampler: string;
    model: string;
    guidance: number;
    publicView: boolean;
    imageData?: ImageData[]
}
type ImageMetadataStore = {
    metadata: ImageMetaData,
    initializeMetadata: (data: any) => void
    addImage: (data: ImageData) => void
    resetMetadata: () => void
};

interface ImageData {
  base64String: string;
  seed: number; 
}

const initialMetadataState = {
  positivePrompt: '',
      negativePrompt: 'cropped, out of focus, symbol, text, logo, door frame, window frame, mirror frame',
      sampler: '',
      model: '',
      guidance: 7,
      publicView: false,
      imageData: [
        {
          base64String: '',
          seed: 1
        }
      ]
    }

const useImageMetadataStore = create<ImageMetadataStore>((set) => ({
    // Initial metadata (consider default values)
    metadata: initialMetadataState,
  
    // Actions to update metadata
    initializeMetadata: (data) => set({ metadata: {
      ...data,
      negativePrompt: data.negativePrompt !== '' ? data.negativePrompt : 'cropped, out of focus, symbol, text, logo, door frame, window frame, mirror frame'
    }  }),

    addImage: (imageData) => set((state) => ({ 
      ...state,
      metadata: {
          ...state.metadata, 
          imageData: state.metadata.imageData ? [...state.metadata.imageData, imageData] :  [imageData]
      },
    })),

    resetMetadata: () => set({metadata: initialMetadataState})
  }));
  
  export default useImageMetadataStore;