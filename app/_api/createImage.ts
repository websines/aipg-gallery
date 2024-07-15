import { defaultApiKey, ClientHeader, BASE_API_URL } from "@/constants"
import { CreateImageResponse, IApiParams, GenerateResponse } from "@/types"
import { fetchApikey } from "./fetchApiKey"



let isPending = false

export const createImage = async (
  imageDetails: any
): Promise<CreateImageResponse> => {
  const apikey = defaultApiKey 

  if (!apikey) {
    return {
      success: false,
      status: 'MISSING_API_KEY',
      message: 'Incorrect API key'
    }
  }

  if (isPending) {
    return {
      success: false,
      status: 'WAITING_FOR_PENDING_JOB',
      message: 'Waiting for pending request to finish.'
    }
  }

  isPending = true
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
    isPending = false

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

    

  
    

    if (statusCode === 429) {
      return {
        statusCode,
        success: false,
        status: 'MAX_REQUEST_LIMIT',
        message
      }
    }

    if (statusCode === 503) {
      return {
        statusCode,
        success: false,
        status: 'HORDE_OFFLINE',
        message
      }
    }

    if (!id) {
      return {
        statusCode,
        success: false,
        message,
        status: 'MISSING_JOB_ID'
      }
    }

    return {
      success: true,
      jobId: id
    }
  } catch (err) {
    isPending = false

    // Handles weird issue where Safari encodes API key using unicode text.
    if (
      //@ts-ignore
      err.name === 'TypeError' &&
      //@ts-ignore
      err.message.indexOf(`Header 'apikey' has invalid value`) >= 0
    ) 

   

    console.log(`--- createImage: Unknown Error ---`)
    console.log(err)

    return {
      success: false,
      status: 'UNKNOWN_ERROR',
      message: 'Unable to create image. Please try again soon.'
    }
  }
}