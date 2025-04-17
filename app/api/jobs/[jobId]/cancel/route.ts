import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';
import { updateJobStatus } from '@/app/_api/jobTrackingService';
import { BASE_API_URL, ClientHeader } from '@/constants';

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const jobId = params.jobId;
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID is required' },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    // First, try to cancel the job via the external API
    const externalCancelResult = await cancelJobExternal(jobId);
    
    // Update our local job status regardless of external API result
    await updateJobStatus(jobId, 'cancelled', { 
      cancelled_at: new Date().toISOString(),
      cancelled_by: userId
    });

    // If the cancellation returned any partial images, save them
    let savedImages = [];
    if (externalCancelResult.success && 
        externalCancelResult.data && 
        externalCancelResult.data.generations && 
        externalCancelResult.data.generations.length > 0) {
      
      try {
        // Import the saveImageData function
        const { saveImageData, saveMetadata } = await import('@/app/_api/saveImageToSupabase');
        
        // Save each partial image
        for (const generation of externalCancelResult.data.generations) {
          if (generation.img) {
            // First create metadata
            const metadataResult = await saveMetadata({
              positive_prompt: generation.prompt || 'Cancelled job',
              negative_prompt: '',
              sampler: 'unknown',
              model: generation.model || 'unknown',
              guidance: 7.5,
              public_view: true,
              user_id: userId
            });
            
            if (!metadataResult.success || !metadataResult.id) {
              console.error('Failed to create metadata for cancelled job image:', metadataResult.error);
              continue;
            }
            
            // Then save the image with the metadata id
            const saveResult = await saveImageData({
              image_url: generation.img,
              seed: generation.seed || '',
              metadata_id: metadataResult.id
            });
            
            if (saveResult.success) {
              savedImages.push(saveResult.id || '');
            }
          }
        }
      } catch (saveError) {
        console.error('Error saving partial images from cancelled job:', saveError);
      }
    }

    return NextResponse.json({
      success: true,
      externalResult: externalCancelResult,
      message: 'Job cancelled successfully',
      savedImages: savedImages.length > 0 ? savedImages : undefined
    });
  } catch (error) {
    console.error(`Error cancelling job ${jobId}:`, error);
    return NextResponse.json(
      { error: 'Failed to cancel job', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Function to cancel job via external API
async function cancelJobExternal(jobId: string): Promise<any> {
  try {
    console.log(`Attempting to cancel job ${jobId} with external API`);
    
    // Use the same endpoint structure as in fetchFinishedImage.ts but with DELETE method
    // This is more likely to work since we know the status endpoint exists
    const response = await fetch(`${BASE_API_URL}/generate/status/${jobId}`, {
      method: 'DELETE',  // Try DELETE method for cancellation
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': ClientHeader
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`External API returned non-OK status when cancelling job ${jobId}:`, response.status, errorText);
      
      // If DELETE method fails, we'll just mark it as cancelled in our system
      console.log(`External API doesn't support cancellation. Marking job ${jobId} as cancelled in our system only.`);
      
      return {
        success: true,
        message: "Job marked as cancelled in local tracking system",
        note: "External API cancellation not supported, but job is marked as cancelled in our system"
      };
    }

    // The API might return any already generated images
    const data = await response.json();
    console.log(`Successfully cancelled job ${jobId} with external API`);
    
    // If there are any generated images, we can save them
    if (data && data.generations && data.generations.length > 0) {
      console.log(`Job ${jobId} returned ${data.generations.length} partial images before cancellation`);
    }
    
    return {
      success: true,
      data,
      message: "Job successfully cancelled with external API"
    };
  } catch (error) {
    console.error(`Error calling external cancel API for job ${jobId}:`, error);
    
    // Even if the external API call fails, we'll still mark it as cancelled in our system
    return {
      success: true,
      message: "Job marked as cancelled in local tracking system",
      note: "External API cancellation failed, but job is marked as cancelled in our system",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
