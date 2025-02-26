import { defaultApiKey, ClientHeader, BASE_API_URL } from "@/constants"
import { CreateImageResponse, IApiParams, GenerateResponse } from "@/types"
import { fetchApikey } from "./fetchApiKey"
import { createJobTracking } from "./jobTrackingService"

export const createImage = async (
  imageDetails: any,
  userId?: string
): Promise<CreateImageResponse> => {
  const apikey = defaultApiKey 

  if (!apikey) {
    return {
      success: false,
      status: 'MISSING_API_KEY',
      message: 'Incorrect API key'
    }
  }

  const imageParams = imageDetails

  try {
    const resp = await fetch(`${BASE_API_URL}/generate/async`, {
      method: 'POST',
      body: JSON.stringify(imageParams),
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
        const model = imageParams.params?.model || '';
        
        // Create job tracking record
        await createJobTracking({
          jobId: id,
          userId,
          status: 'pending',
          prompt,
          model,
          params: imageParams.params || {}
        });
        
        console.log(`Job tracking created for job ID: ${id}`);
      } catch (trackingError) {
        console.error('Error creating job tracking:', trackingError);
        // We don't want to fail the request if tracking fails
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