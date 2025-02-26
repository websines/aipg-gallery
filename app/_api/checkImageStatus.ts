import { BASE_API_URL, ClientHeader } from "@/constants"
import { CheckResponse } from "@/types"

// Use a Map instead of a plain object for better performance
const jobStatusCache = new Map<string, { status: string, timestamp: number }>();

// Cache expiration time (10 minutes)
const CACHE_EXPIRATION = 10 * 60 * 1000;

export const checkImageStatus = async (
  jobId: string
): Promise<CheckResponse> => {
  try {
    if (!jobId) {
      return {
        success: false,
        status: 'INVALID_JOB_ID',
        message: 'Invalid job ID',
        jobId
      };
    }

    // Check if we have a cached failed status
    const cachedStatus = jobStatusCache.get(jobId);
    if (cachedStatus) {
      // Check if the cache has expired
      if (Date.now() - cachedStatus.timestamp < CACHE_EXPIRATION) {
        if (cachedStatus.status === 'NOT_FOUND') {
          return {
            success: false,
            status: 'NOT_FOUND',
            message: 'Job has gone stale and has been removed from the AI Horde backend. Retry?',
            jobId
          };
        }
      } else {
        // Cache expired, remove it
        jobStatusCache.delete(jobId);
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
    );

    const statusCode = res.status;
    
    if (statusCode === 404) {
      // Cache the NOT_FOUND status
      jobStatusCache.set(jobId, { status: 'NOT_FOUND', timestamp: Date.now() });

      return {
        success: false,
        status: 'NOT_FOUND',
        message: 'Job has gone stale and has been removed from the AI Horde backend. Retry?',
        jobId
      };
    }

    if (statusCode === 429) {
      return {
        success: false,
        status: 'RATE_LIMITED',
        message: 'You are being rate limited. Please try again later.',
        jobId
      };
    }

    const data = await res.json();
    
    return {
      success: true,
      ...data,
      jobId
    };
  } catch (error) {
    console.error('Error checking image status:', error);
    return {
      success: false,
      status: 'ERROR',
      message: 'An error occurred while checking the image status.',
      jobId
    };
  }
};