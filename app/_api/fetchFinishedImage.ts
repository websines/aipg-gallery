import { BASE_API_URL, ClientHeader } from "@/constants"
import { FinishedImageResponse, FinishedImageResponseError, GeneratedImage } from "@/types"
import { blobToBase64 } from "@/utils/helperUtils"
import { generateBase64Thumbnail, isBase64UrlImage } from "@/utils/imageUtils"
import { isValidHttpUrl } from "@/utils/validationUtils"
import { updateJobStatus, getJobById } from "./jobTrackingService"

// Use a rate limiter approach instead of a global flag
const rateLimiter = {
  isLimited: false,
  lastRequestTime: 0,
  requestCount: 0,
  resetTime: 0,
  maxRequests: 8, // Allow 8 requests per minute (leaving buffer)
  minInterval: 1000, // 1 second between requests
  cooldown: 60000,   // 60 seconds cooldown after hitting rate limit
  
  checkLimit() {
    const now = Date.now();
    
    // Reset counter if we're past the reset time
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000; // Reset every minute
    }
    
    // If we're in cooldown mode
    if (this.isLimited) {
      if (now - this.lastRequestTime > this.cooldown) {
        this.isLimited = false;
        this.lastRequestTime = now;
        this.requestCount = 1;
        return false;
      }
      return true;
    }
    
    // Check if we've exceeded the max requests per minute
    if (this.requestCount >= this.maxRequests) {
      this.isLimited = true;
      this.lastRequestTime = now;
      return true;
    }
    
    // Normal rate limiting for individual requests
    if (now - this.lastRequestTime < this.minInterval) {
      this.requestCount++;
      if (this.requestCount >= this.maxRequests) {
        this.isLimited = true;
      }
      this.lastRequestTime = now;
      return this.isLimited;
    }
    
    this.requestCount++;
    this.lastRequestTime = now;
    return false;
  },
  
  startCooldown() {
    this.isLimited = true;
    this.lastRequestTime = Date.now();
  }
};

export const fetchImageFromUrl = async (imgUrl: string) => {
  try {
    if (!isValidHttpUrl(imgUrl)) return false
  
    const imageData = await fetch(imgUrl)
    const blob = await imageData.blob()
    const base64 = (await blobToBase64(blob)) as string
  
    return base64
  } catch (err) {
    console.error('Error fetching image from URL:', err)
    return false
  }
}

export const getFinishedImage = async (
  jobId: string,
  userId?: string
): Promise<FinishedImageResponse | FinishedImageResponseError> => {
  if (!jobId) {
    return {
      success: false,
      status: 'INVALID_JOB_ID',
      message: 'Invalid job ID provided'
    };
  }
  
  if (rateLimiter.checkLimit()) {
    return {
      success: false,
      status: 'API_COOLDOWN',
      message: 'Temporarily throttling API calls'
    }
  }

  try {
    console.log("Fetching image status for jobId:", jobId);
    
    // Update job status to processing if we have a userId
    if (userId) {
      try {
        // Check if we have this job in our database
        const jobResult = await getJobById(jobId);
        if (jobResult.success && jobResult.data) {
          // If job status is still pending, update to processing
          if (jobResult.data.status === 'pending') {
            await updateJobStatus(jobId, 'processing');
            console.log(`Updated job ${jobId} status to processing`);
          }
        }
      } catch (trackingError) {
        console.error('Error updating job status:', trackingError);
        // Continue with the request even if tracking fails
      }
    }
    
    const res = await fetch(`${BASE_API_URL}/generate/status/${jobId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': ClientHeader
      }
    })

    const statusCode = res.status
    console.log("API response status code:", statusCode);
    
    if (statusCode === 429) {
      rateLimiter.startCooldown();
      
      // Update job status if rate limited
      if (userId) {
        try {
          await updateJobStatus(jobId, 'processing', { rate_limited: true });
        } catch (trackingError) {
          console.error('Error updating job status for rate limit:', trackingError);
        }
      }
      
      return {
        success: false,
        status: 'RATE_LIMITED',
        message: 'You are being rate limited. Please try again later.'
      }
    }

    if (statusCode === 404) {
      // Update job status if not found
      if (userId) {
        try {
          await updateJobStatus(jobId, 'failed', { reason: 'Job not found' });
        } catch (trackingError) {
          console.error('Error updating job status for not found:', trackingError);
        }
      }
      
      return {
        success: false,
        status: 'NOT_FOUND',
        message: 'Job not found'
      }
    }

    if (statusCode !== 200) {
      // Update job status for API error
      if (userId) {
        try {
          await updateJobStatus(jobId, 'failed', { 
            reason: 'API error', 
            status_code: statusCode 
          });
        } catch (trackingError) {
          console.error('Error updating job status for API error:', trackingError);
        }
      }
      
      return {
        success: false,
        status: 'API_ERROR',
        message: `API returned status code ${statusCode}`
      }
    }

    const data = await res.json()
    console.log("Raw API response data:", JSON.stringify(data, null, 2));
    
    // Log the entire API response for debugging
    console.log(`API Response for job ${jobId}:`, JSON.stringify(data, null, 2));

    // Check for rate limiting message in the response
    if (data.message && typeof data.message === 'string' && 
        (data.message.includes('per minute') || data.message.includes('rate limit'))) {
      console.log("Rate limit detected in response message:", data.message);
      rateLimiter.startCooldown();
      
      // Update job status if rate limited
      if (userId) {
        try {
          await updateJobStatus(jobId, 'processing', { 
            rate_limited: true,
            retry_after: 60 // Suggest retry after 60 seconds
          });
        } catch (trackingError) {
          console.error('Error updating job status for rate limit:', trackingError);
        }
      }
      
      return {
        success: false,
        status: 'RATE_LIMITED',
        message: 'You are being rate limited. Please try again in 60 seconds.',
        retryAfter: 60
      }
    }
    
    if (!data) {
      // Update job status for invalid response
      if (userId) {
        try {
          await updateJobStatus(jobId, 'failed', { reason: 'Invalid response' });
        } catch (trackingError) {
          console.error('Error updating job status for invalid response:', trackingError);
        }
      }
      
      return {
        success: false,
        status: 'INVALID_RESPONSE',
        message: 'Invalid response from API'
      }
    }

    if (data.faulted) {
      // Update job status for faulted generation
      if (userId) {
        try {
          await updateJobStatus(jobId, 'failed', { reason: 'Generation faulted' });
        } catch (trackingError) {
          console.error('Error updating job status for faulted generation:', trackingError);
        }
      }
      
      return {
        success: false,
        status: 'GENERATION_FAULTED',
        message: 'Generation faulted'
      }
    }

    // Check if the job is still processing and extract wait time and queue position
    if (data.processing > 0 || !data.done) {
      // Extract wait time and queue position if available
      const waitTime = data.wait_time || 0;
      const queuePosition = data.queue_position || 0;
      
      console.log(`Job ${jobId} is still processing. Wait time: ${waitTime}s, Queue position: ${queuePosition}`);
      
      // Update job status with wait time and queue position
      if (userId) {
        try {
          await updateJobStatus(jobId, 'processing', { 
            wait_time: waitTime,
            queue_position: queuePosition
          });
        } catch (trackingError) {
          console.error('Error updating job status with wait time:', trackingError);
        }
      }
      
      return {
        success: false,
        status: 'PROCESSING',
        message: 'Job is still processing',
        waitTime,
        queuePosition
      };
    }

    if (!data.generations || data.generations.length === 0) {
      // If job is still processing, don't mark as failed
      if (data.processing && userId) {
        try {
          await updateJobStatus(jobId, 'processing', { 
            wait_time: data.wait_time,
            queue_position: data.queue_position
          });
        } catch (trackingError) {
          console.error('Error updating job status for processing:', trackingError);
        }
      }
      
      return {
        success: false,
        status: 'NO_GENERATIONS',
        message: 'No generations found'
      }
    }

    // Process the generations
    const generations = await Promise.all(
      data.generations.map(async (generation: any) => {
        try {
          // Log the raw generation data to see what we're getting from the API
          console.log("Raw generation data:", JSON.stringify(generation, null, 2));
          
          // Check if the generation has direct image data
          if (generation.image) {
            console.log("Found direct image data");
            try {
              // Try to convert it to a base64 string
              const base64WithPrefix = `data:image/webp;base64,${generation.image}`;
              const thumbnail = await generateBase64Thumbnail(base64WithPrefix);
              
              const generatedImage: GeneratedImage = {
                base64String: base64WithPrefix,
                thumbnail,
                seed: generation.seed || 0,
                id: generation.id || `gen-${Date.now()}`
              };
              
              return generatedImage;
            } catch (e) {
              console.error("Error processing direct image data:", e);
            }
          }
          
          // For images with legacy URLs - prioritize using the direct URL
          if (generation.img_url) {
            console.log("Original img_url:", generation.img_url);
            
            // Extract the actual URL if it has a data:image prefix
            // This regex will match URLs even if they're prefixed with data:image/png;base64,
            const urlRegex = /(https?:\/\/[^\s"']+)/;
            const match = generation.img_url.match(urlRegex);
            
            let cleanedUrl = generation.img_url;
            if (match && match[1]) {
              cleanedUrl = match[1];
              console.log("Cleaned URL:", cleanedUrl);
            }
            
            // Create a new generation object with the cleaned URL
            const generatedImage: GeneratedImage = {
              img_url: cleanedUrl,
              seed: generation.seed || 0,
              id: generation.id || `gen-${Date.now()}`
            };
            
            return generatedImage;
          }
          
          // For images with the new 'img' field (direct URL)
          if (generation.img && typeof generation.img === 'string') {
            console.log("Found image in img field:", generation.img.substring(0, 50) + "...");
            
            // Check if it's a URL
            if (isValidHttpUrl(generation.img)) {
              console.log("It's a valid URL");
              // Create a new generation object with the image URL
              const generatedImage: GeneratedImage = {
                img_url: generation.img,
                seed: generation.seed || 0,
                id: generation.id || `gen-${Date.now()}`
              };
              
              return generatedImage;
            } 
            // Check if it's a base64 string
            else if (isBase64UrlImage(generation.img)) {
              console.log("It's a base64 image");
              // It's already a base64 string with data:image prefix
              const thumbnail = await generateBase64Thumbnail(generation.img);
              
              const generatedImage: GeneratedImage = {
                base64String: generation.img,
                thumbnail,
                seed: generation.seed || 0,
                id: generation.id || `gen-${Date.now()}`
              };
              
              return generatedImage;
            }
            // If it's a base64 string without the prefix
            else if (generation.img.length > 100) {
              console.log("It might be a base64 string without prefix");
              // Try to add the prefix and see if it works
              const base64WithPrefix = `data:image/webp;base64,${generation.img}`;
              try {
                const thumbnail = await generateBase64Thumbnail(base64WithPrefix);
                
                const generatedImage: GeneratedImage = {
                  base64String: base64WithPrefix,
                  thumbnail,
                  seed: generation.seed || 0,
                  id: generation.id || `gen-${Date.now()}`
                };
                
                return generatedImage;
              } catch (e) {
                console.error("Error processing as base64:", e);
              }
            }
          }
          
          // Fallback if we couldn't process the image
          return {
            seed: generation.seed || 0,
            id: generation.id || `gen-${Date.now()}`
          } as GeneratedImage;
        } catch (error) {
          console.error("Error processing generation:", error);
          return {
            seed: generation.seed || 0,
            id: generation.id || `gen-${Date.now()}`,
            error: String(error)
          } as GeneratedImage;
        }
      })
    );
    
    // Update job status to completed with the result data
    if (userId) {
      try {
        await updateJobStatus(jobId, 'completed', { 
          generations: generations.map(gen => ({
            id: gen.id,
            seed: gen.seed,
            img_url: gen.img_url
          }))
        });
        console.log(`Updated job ${jobId} status to completed`);
      } catch (trackingError) {
        console.error('Error updating job status to completed:', trackingError);
      }
    }

    return {
      success: true,
      generations
    };
  } catch (error) {
    console.error("Error fetching finished image:", error);
    
    // Update job status for unexpected error
    if (userId) {
      try {
        await updateJobStatus(jobId, 'failed', { 
          reason: 'Unexpected error',
          error: String(error)
        });
      } catch (trackingError) {
        console.error('Error updating job status for unexpected error:', trackingError);
      }
    }
    
    return {
      success: false,
      status: 'UNEXPECTED_ERROR',
      message: String(error)
    };
  }
}
