import { IApiParams } from "@/types"

export const isValidHttpUrl = (string: string = '') => {
    let url
    try {
      url = new URL(string)
    } catch (_) {
      return false
    }
    return url.protocol === 'http:' || url.protocol === 'https:'
  }


  export const transformFormData = (formData: any) => {
    return {
        prompt:  `${formData.postivePrompt} ### ${formData.negativePrompt || 'cropped, out of focus, symbol, text, logo, door frame, window frame, mirror frame'}`, // Corrected spelling of 'positivePrompt'
        params: {
            sampler_name: formData.sampler || "", // Handle the case when sampler is not provided
            cfg_scale: formData.guidance || 7, // Handle the case when guidance is not provided
            height: Number(formData.height), // Convert to a number
            width: Number(formData.width), // Convert to a number
            seed: formData.seed || "", // Allow empty seed
            steps: formData.steps || 15, // Handle the case when steps is not provided
            karras: formData.karras || false,
            hires_fix: formData.hires_fix || false,
            clip_skip: formData.clip_skip || 1, // Corrected spelling of 'clip_skip'
            n: formData.batchSize || 1, // Handle the case when batchSize is not provided
            post_processing: (formData.postprocessors || []).map((pp: any) => pp.value), // Extract values
            // Add more params fields as needed
        },

        nsfw: formData.nsfw || false,
        censor_nsfw: formData.censor_nsfw || false,
        trusted_workers: formData.trusted_workers || false,
        models: [formData.model], // Assumes 'model' is a singular string field
        r2: formData.r2 || true, // Handle the case when r2 is not provided
        replacement_filter: formData.replacement_filter || true,
        shared: formData.shared || false,
        slow_workers: formData.slow_workers || true,
        dry_run: formData.dry_run || false,
        // Add any extra IApiParams fields if needed
    };
};
