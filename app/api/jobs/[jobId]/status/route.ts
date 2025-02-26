import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/client';
import { getJobById } from '@/app/_api/jobTrackingService';
import { getFinishedImage } from '@/app/_api/fetchFinishedImage';

export async function GET(
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

  try {
    // Get job status from the database
    const { success, data: job, error } = await getJobById(jobId);

    if (!success || !job) {
      console.log(`Job ${jobId} not found or error:`, error);
      
      // If job not found in our database, try to fetch it from the API
      if (userId) {
        try {
          const result = await getFinishedImage(jobId, userId);
          
          if (result.success) {
            return NextResponse.json({
              status: 'completed',
              result: {
                generations: result.generations
              }
            });
          }
        } catch (fetchError) {
          console.error(`Error fetching job ${jobId} from API:`, fetchError);
        }
      }
      
      return NextResponse.json(
        { status: 'unknown', error: error || 'Job not found' },
        { status: 404 }
      );
    }

    // Return job status and data
    return NextResponse.json({
      status: job.status,
      result: job.result,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    });
  } catch (error) {
    console.error(`Error getting status for job ${jobId}:`, error);
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    );
  }
}
