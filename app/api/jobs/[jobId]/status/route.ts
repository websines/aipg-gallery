import { NextRequest, NextResponse } from "next/server";
import { getJobById } from "@/app/_api/jobTrackingService";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getFinishedImage } from "@/app/_api/fetchFinishedImage";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }
    
    // Get user from session
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get job from database
    const jobResult = await getJobById(jobId);
    
    if (!jobResult.success || !jobResult.data || jobResult.data.user_id !== user.id) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }
    
    const job = jobResult.data;
    
    // If job is completed, return the result
    if (job.status === 'completed') {
      return NextResponse.json({
        status: 'completed',
        success: true,
        message: 'Job completed successfully',
        images: job.result?.images || []
      });
    }
    
    // If job is failed or cancelled, return the error
    if (job.status === 'failed' || job.status === 'cancelled') {
      return NextResponse.json({
        status: job.status,
        success: false,
        message: job.error || `Job ${job.status}`
      });
    }
    
    // If job is still processing, check with the API
    if (job.status === 'processing') {
      const result = await getFinishedImage(jobId, user.id);
      
      if (result.success) {
        // Use type assertion to help TypeScript understand this is FinishedImageResponse
        const successResult = result as { success: true, status: string, message: string, images: any[] };
        
        // Job is completed
        return NextResponse.json({
          status: 'completed',
          success: true,
          message: 'Job completed successfully',
          images: successResult.images
        });
      } else if (result.status === 'PROCESSING') {
        // Job is still processing
        return NextResponse.json({
          status: 'processing',
          success: false,
          message: 'Job is still processing',
          waitTime: result.waitTime,
          queuePosition: result.queuePosition
        });
      } else {
        // Job failed
        return NextResponse.json({
          status: 'failed',
          success: false,
          message: result.message
        });
      }
    }
    
    // Default response for other statuses
    return NextResponse.json({
      status: job.status,
      success: false,
      message: `Job is in ${job.status} state`
    });
    
  } catch (error) {
    console.error("Error checking job status:", error);
    return NextResponse.json(
      { error: "Failed to check job status" },
      { status: 500 }
    );
  }
}
