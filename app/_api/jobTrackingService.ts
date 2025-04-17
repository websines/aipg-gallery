import { createClient } from '@supabase/supabase-js';
import { GeneratedImage } from '@/types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single Supabase client instance
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface JobData {
  jobId: string;
  userId: string;
  status: JobStatus;
  prompt: string;
  model?: string;
  params?: any;
  resultData?: any;
}

/**
 * Create a new job tracking record
 */
export const createJobTracking = async (jobData: JobData) => {
  try {
    console.log(`Attempting to create job tracking for job ID: ${jobData.jobId}, User ID: ${jobData.userId}`);
    // First check if the job already exists to avoid duplicates
    const { data: existingJob, error: checkError } = await supabase
      .from('job_tracking')
      .select('job_id')
      .eq('job_id', jobData.jobId)
      .maybeSingle();
    
    if (checkError) {
      console.error(`Error checking for existing job ${jobData.jobId}:`, checkError);
      // Decide if we should return error or attempt insert anyway? For now, let's return.
      return { success: false, error: checkError };
    }
    
    if (existingJob) {
      console.log(`Job ${jobData.jobId} already exists, skipping creation`);
      return { success: true, data: existingJob };
    }
    
    // Prepare data for insertion
    const insertData = {
      job_id: jobData.jobId,
      user_id: jobData.userId,
      status: jobData.status,
      prompt: jobData.prompt,
      model: jobData.model,
      params: jobData.params
    };
    
    console.log(`Inserting job tracking data for ${jobData.jobId}:`, JSON.stringify(insertData));
    
    // Insert the new job
    const { data, error } = await supabase
      .from('job_tracking')
      .insert(insertData)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error(`Error inserting job tracking for ${jobData.jobId}:`, error);
      
      // If we get an RLS error, try a different approach
      if (error.code === 'PGRST301' || error.message.includes('policy')) {
        console.log('Attempting alternative approach due to RLS policy...');
        
        const minimalInsertData = {
          job_id: jobData.jobId,
          user_id: jobData.userId,
          status: jobData.status
        };
        
        console.log(`Inserting minimal job tracking data for ${jobData.jobId}:`, JSON.stringify(minimalInsertData));
        
        // Try again with minimal data
        const { data: minimalData, error: minimalError } = await supabase
          .from('job_tracking')
          .insert(minimalInsertData)
          .select()
          .maybeSingle();
          
        if (minimalError) {
          console.error(`Error inserting minimal job tracking for ${jobData.jobId}:`, minimalError);
          return { success: false, error: minimalError };
        }
        
        console.log(`Minimal job tracking inserted successfully for ${jobData.jobId}`);
        return { success: true, data: minimalData };
      }
      
      // Return the original error if it wasn't RLS-related
      return { success: false, error };
    }
    
    console.log(`Job tracking inserted successfully for ${jobData.jobId}`);
    return { success: true, data };
  } catch (error) {
    console.error(`Exception creating job tracking for ${jobData.jobId}:`, error);
    return { success: false, error };
  }
};

/**
 * Update job status
 */
export const updateJobStatus = async (jobId: string, status: JobStatus, resultData?: any) => {
  try {
    const updateData: any = { status };
    
    if (resultData) {
      updateData.result_data = resultData;
    }
    
    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('job_tracking')
      .update(updateData)
      .eq('job_id', jobId)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('Error updating job status:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exception updating job status:', error);
    return { success: false, error };
  }
};

/**
 * Get all active jobs for a user
 */
export const getUserActiveJobs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('job_tracking')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user active jobs:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exception fetching user active jobs:', error);
    return { success: false, error };
  }
};

/**
 * Get job details by job ID
 */
export const getJobById = async (jobId: string) => {
  try {
    // Use maybeSingle instead of single to avoid error when no rows are found
    const { data, error } = await supabase
      .from('job_tracking')
      .select('*')
      .eq('job_id', jobId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching job by ID:', error);
      return { success: false, error };
    }
    
    // If no data was found, return success but with null data
    if (!data) {
      return { success: true, data: null };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exception fetching job by ID:', error);
    return { success: false, error };
  }
};

/**
 * Get the most recent completed jobs for a user
 */
export const getUserCompletedJobs = async (userId: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('job_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching user completed jobs:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exception fetching user completed jobs:', error);
    return { success: false, error };
  }
};

/**
 * Clean up old jobs (can be called periodically)
 */
export const cleanupOldJobs = async (daysToKeep = 7) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const { data, error } = await supabase
      .from('job_tracking')
      .delete()
      .lt('created_at', cutoffDate.toISOString());
    
    if (error) {
      console.error('Error cleaning up old jobs:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exception cleaning up old jobs:', error);
    return { success: false, error };
  }
};

/**
 * Cancel a job
 */
export const cancelJob = async (jobId: string, userId: string) => {
  try {
    console.log(`Cancelling job ${jobId} for user ${userId}`);
    
    // Call the cancel API endpoint
    const response = await fetch(`/api/jobs/${jobId}/cancel?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error cancelling job:', errorData);
      
      // Check for rate limiting
      if (response.status === 429 || (errorData.error && errorData.error.includes('rate limit'))) {
        return { 
          success: false, 
          status: 'RATE_LIMITED',
          message: 'Rate limited. Please try again later.',
          retryAfter: 60
        };
      }
      
      return { 
        success: false, 
        error: errorData.error || 'Failed to cancel job' 
      };
    }
    
    const data = await response.json();
    
    // Update the job status in our database
    await updateJobStatus(jobId, 'cancelled', { 
      cancelled_at: new Date().toISOString(),
      cancelled_by: userId
    });
    
    // Return any partial images that were saved
    return { 
      success: true, 
      data,
      partialImages: data.savedImages || []
    };
  } catch (error) {
    console.error('Exception cancelling job:', error);
    return { success: false, error };
  }
};
