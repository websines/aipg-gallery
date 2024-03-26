import { BASE_API_URL, ClientHeader } from "@/constants"
import { CheckResponse } from "@/types"



interface HackyJobCheck {
  [key: string]: boolean
}

const hacky404JobCheck: HackyJobCheck = {}

export const checkImageStatus = async (
  jobId: string
): Promise<CheckResponse> => {
  try {
    if (hacky404JobCheck[jobId]) {
      return {
        success: false,
        status: 'NOT_FOUND',
        message:
          'Job has gone stale and has been removed from the Stable Horde backend. Retry?',
        jobId
      }
    }

    const res = await fetch(
      `${BASE_API_URL}/generate/check/${jobId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': ClientHeader
        }
      }
    )

    const statusCode = res.status
    if (statusCode === 404) {
      hacky404JobCheck[jobId] = true

      return {
        success: false,
        status: 'NOT_FOUND',
        message:
          'Job has gone stale and has been removed from the Stable Horde backend. Retry?',
        jobId
      }
    }

    if (statusCode === 429) {
      return {
        success: false,
        status: 'WAITING_FOR_PENDING_REQUEST',
        jobId
      }
    }

    const data = await res.json()

    return {
      success: true,
      ...data
    }
  } catch (err) {
    return {
      success: false,
      status: 'UNKNOWN_ERROR',
      jobId
    }
  }
}