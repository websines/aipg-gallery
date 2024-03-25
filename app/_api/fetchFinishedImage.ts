import { BASE_API_URL, ClientHeader } from "@/constants"
import { FinishedImageResponse, FinishedImageResponseError, GeneratedImage } from "@/types"
import { blobToBase64 } from "@/utils/helperUtils"
import { generateBase64Thumbnail, isBase64UrlImage } from "@/utils/imageUtils"
import { isValidHttpUrl } from "@/utils/validationUtils"


let isCoolingOff = false

const apiCooldown = (timeoutMs: number = 15000) => {
  if (isCoolingOff) {
    return
  }

  isCoolingOff = true

  setTimeout(() => {
    isCoolingOff = false
  }, timeoutMs)
}

export const fetchImageFromUrl = async (imgUrl: string) => {
    try {
      if (!isValidHttpUrl(imgUrl)) return false
  
      const imageData = await fetch(imgUrl)
      const blob = await imageData.blob()
      const base64 = (await blobToBase64(blob)) as string
  
      // Attempt to handle an error that sometimes occurs, where R2 returns an invalid response.
      // For whatever reason, ArtBot still processes this as an image.
      const validImage = await isBase64UrlImage(base64)
      if (!validImage) return false
  
      return base64.split(',')[1]
    } catch (e) {
      return false
    }
  }



export const getFinishedImage = async (
    jobId: string
  ): Promise<FinishedImageResponse | FinishedImageResponseError> => {
    if (isCoolingOff) {
      return {
        success: false,
        status: 'API_COOLDOWN',
        message: 'Temporarily throttling API calls'
      }
    }
  
    if (!jobId) {
      return {
        success: false,
        status: 'MISSING_JOBID',
        message: 'Missing JobID'
      }
    }
  
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/v2/generate/status/${jobId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Client-Agent': ClientHeader
          }
        }
      )
  
      const status = res.status
      const data = await res.json()
  
      const { generations, kudos, message, shared, faulted } = data
  
      if (status === 404) {
        apiCooldown(5000)
        return {
          success: false,
          status: 'NOT_FOUND',
          message:
            'Job has gone stale and has been removed from the Stable Horde backend. Retry?',
          jobId
        }
      }
  
      if (message === '2 per 1 minute' || status === 429) {
        apiCooldown(30000)
        return {
          success: false,
          status: 'WAITING_FOR_PENDING_REQUEST',
          message: 'Currently waiting for a pending request',
          jobId
        }
      }
  
      if (faulted) {
        return {
          success: false,
          status: 'WORKER_GENERATION_ERROR',
          message:
            'Worker encountered an error while trying to generate this image'
        }
      }
  
      const generationDetails: Array<
        GeneratedImage | FinishedImageResponseError
      > = []
      if (Array.isArray(generations) && generations.length > 0) {
        for (const image of generations) {
          if (!generations || !image) {
            return {
              success: false,
              status: 'WORKER_GENERATION_ERROR',
              message:
                'Worker encountered an error while trying to generate this image'
            }
          }
  
          // If GPU worker triggers content safety warning and censors image,
          // use this to display a more helpful image instead.
          if (image.censored) {
            return {
              success: false,
              status: 'JOB_CANCELED_CENSORED',
              message:
                'The worker was unable to generate an image for this request. Please try again.'
            }
          }
  
          const base64String = await fetchImageFromUrl(image.img)
  
          if (base64String) {
            const thumbnail = await generateBase64Thumbnail(base64String, jobId)
  
            generationDetails.push({
              base64String,
              thumbnail,
              censored: image.censored,
              model: image.model,
              seed: image.seed,
              hordeImageId: image.id,
              worker_id: image.worker_id,
              worker_name: image.worker_name
            })
          } else {
            generationDetails.push({
              success: false,
              status: 'INVALID_IMAGE_FROM_API',
              message:
                'An error occurred while attempting to generate this image. Please try again.'
            })
          }
        }
  
        return {
          success: true,
          jobId,
          canRate: shared ? true : false,
          kudos: kudos / generationDetails.length,
          generations: generationDetails // Initial work to handle returning multiple images
        }
      }
  
      return {
        success: false,
        status: 'UNKNOWN_ERROR',
        message: 'An error occurred while trying to process this image.'
      }
    } catch (err) {
      return {
        success: false,
        status: 'UNKNOWN_ERROR',
        message: 'An error occurred while trying to process this image.'
      }
    }
  }