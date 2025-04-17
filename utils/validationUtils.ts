import { IApiParams, FormSchema } from "@/types"

export const isValidHttpUrl = (string: string = '') => {
    let url
    try {
      url = new URL(string)
    } catch (_) {
      return false
    }
    return url.protocol === 'http:' || url.protocol === 'https:'
  }


  export const transformFormData = (
    data: FormSchema
  ): any => {
    console.log("transformFormData received dimensions:", { 
      width: data.width, 
      height: data.height, 
      types: { 
        width: typeof data.width, 
        height: typeof data.height 
      }
    });

    // Common parameters for all generation types
    const transformedData: any = {
      prompt: data.positivePrompt,
      negative: data.negativePrompt || "",
      params: {
        sampler_name: data.sampler,
        steps: data.steps,
        height: data.height,
        width: data.width,
        karras: data.karras,
        hires_fix: data.hires_fix,
        tiling: data.tiling,
        n: data.batchSize,
        post_processing: data.post_processors || [],
        restore_faces: data.restore_faces,
        clip_skip: data.clipskip,
      },
      nsfw: data.nsfw,
      num_images: data.batchSize,
      model: data.model,
      guidance_scale: data.guidance,
      sampler: data.sampler,
      seed: data.seed || "",
      restore_faces: data.restore_faces,
      post_processors: data.post_processors || [],
      publicView: data.publicView,
    };
    
    console.log("Final transformed dimensions:", { 
      width: transformedData.params.width, 
      height: transformedData.params.height 
    });
    
    // Add image-to-image and inpainting specific parameters
    if (data.generationMode === "image-to-image" || data.generationMode === "inpainting") {
      // Source image is required for both image-to-image and inpainting
      if (data.sourceImage) {
        transformedData.sourceImage = data.sourceImage;
        transformedData.denoising_strength = data.denoising_strength;
      }
      
      // For inpainting, we also need a mask
      if (data.generationMode === "inpainting" && data.sourceMask) {
        transformedData.sourceMask = data.sourceMask;
      }
    }

    return transformedData;
  };
