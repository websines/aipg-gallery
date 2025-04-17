import { defaultApiKey, ClientHeader, BASE_API_URL } from "@/constants"
import { CreateImageResponse, IApiParams, GenerateResponse } from "@/types"
import { fetchApikey } from "./fetchApiKey"
import { createJobTracking } from "./jobTrackingService"

export const createImage = async (
  imageDetails: any,
  userId?: string
): Promise<CreateImageResponse> => {
  const apikey = await fetchApikey(userId)

  if (!apikey) {
    return {
      success: false,
      status: 'MISSING_API_KEY',
      message: 'Incorrect API key'
    }
  }

  const imageParams = imageDetails;
  const isImg2Img = !!imageParams.sourceImage;
  const isInpainting = !!imageParams.sourceImage && !!imageParams.sourceMask;

  // Remove data:image prefix for base64 encoded images if present
  let sourceImage = imageParams.sourceImage;
  if (sourceImage && typeof sourceImage === 'string' && sourceImage.startsWith('data:image')) {
    sourceImage = sourceImage.split(',')[1];
  }

  let sourceMask = imageParams.sourceMask;
  if (sourceMask && typeof sourceMask === 'string' && sourceMask.startsWith('data:image')) {
    sourceMask = sourceMask.split(',')[1];
  }

  try {
    const requestBody: any = {
      ...imageParams,
      params: {
        sampler_name: imageParams.sampler,
        cfg_scale: imageParams.guidance_scale || 7,
        height: imageParams.height || 512,
        width: imageParams.width || 512,
        seed: imageParams.seed || "",
        steps: imageParams.steps || 30,
        karras: imageParams.karras || false,
        hires_fix: imageParams.hires_fix || false,
        clip_skip: imageParams.clipskip || 1,
        tiling: imageParams.tiling || false,
        post_processing: imageParams.post_processors || [],
        n: imageParams.num_images || 1,
        restore_faces: imageParams.restore_faces || false,
      },
      nsfw: imageParams.nsfw || false,
      censor_nsfw: !imageParams.nsfw,
      trusted_workers: true,
      models: [imageParams.model],
      r2: true,
      shared: imageParams.publicView || false,
    };

    // Add image-to-image specific parameters
    if (isImg2Img) {
      requestBody.source_image = sourceImage;
      requestBody.params.denoising_strength = imageParams.denoising_strength || 0.75;
      
      if (isInpainting) {
        requestBody.source_processing = "inpainting";
        requestBody.source_mask = sourceMask;
      } else {
        requestBody.source_processing = "img2img";
      }
    }

    const resp = await fetch(`${BASE_API_URL}/generate/async`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': ClientHeader,
        apikey: apikey
      }
    })

    const statusCode = resp.status
    const data = await resp.json()
    const { id, message = '', kudos }: GenerateResponse = data

    if (imageDetails.dry_run && kudos) {
      return {
        success: true,
        kudos
      }
    }

    if (message.indexOf('unethical images') >= 0) {
      return {
        success: false,
        status: 'QUESTIONABLE_PROMPT_ERROR',
        message
      }
    }

    if (statusCode === 401) {
      return {
        success: false,
        status: 'INVALID_API_KEY',
        message: 'Invalid API key'
      }
    }

    if (statusCode === 429) {
      return {
        success: false,
        status: 'RATE_LIMITED',
        message: 'You are being rate limited. Please try again later.'
      }
    }

    if (statusCode === 503) {
      return {
        success: false,
        status: 'MAINTENANCE_MODE',
        message: 'The Stable Horde is in maintenance mode. Please try again later.'
      }
    }

    if (statusCode === 400) {
      return {
        success: false,
        status: 'BAD_REQUEST',
        message: message || 'Bad request'
      }
    }

    if (statusCode === 403) {
      return {
        success: false,
        status: 'FORBIDDEN',
        message: message || 'Forbidden'
      }
    }

    if (statusCode !== 202) {
      return {
        success: false,
        status: 'UNKNOWN_ERROR',
        message: message || 'Unknown error'
      }
    }

    // If we have a user ID, track this job in the database
    if (userId && id) {
      try {
        // Extract the prompt from the image parameters
        const prompt = imageParams.prompt || '';
        // Use the correct model value from the input details
        const model = imageParams.model || '';
        // Use the params object built for the API request
        const apiParams = requestBody.params || {}; 
        
        // Create job tracking record
        await createJobTracking({
          jobId: id,
          userId,
          status: 'pending',
          prompt,
          model, // Pass the correct model
          params: apiParams // Pass the correct params object
        });
        
        console.log(`Job tracking created for job ID: ${id}`);
      } catch (trackingError) {
        console.error('Error creating job tracking:', trackingError);
        // Return an error instead of proceeding
        let errorMessage = 'Failed to save job details locally. Please try again.';
        if (trackingError instanceof Error) {
          errorMessage = `Failed to save job details locally: ${trackingError.message}`;
        }
        return {
          success: false,
          status: 'TRACKING_ERROR',
          message: errorMessage,
        };
      }
    }

    return {
      success: true,
      jobId: id
    }
  } catch (error) {
    console.error('Error creating image:', error)
    return {
      success: false,
      status: 'NETWORK_ERROR',
      message: 'Network error'
    }
  }
}