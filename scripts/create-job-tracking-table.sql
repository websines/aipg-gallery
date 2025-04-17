-- Create job_tracking table
CREATE TABLE IF NOT EXISTS job_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  prompt TEXT NOT NULL,
  model TEXT,
  params JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  result_data JSONB -- Will store the result data when job completes
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS job_tracking_user_id_idx ON job_tracking(user_id);
CREATE INDEX IF NOT EXISTS job_tracking_job_id_idx ON job_tracking(job_id);
CREATE INDEX IF NOT EXISTS job_tracking_status_idx ON job_tracking(status);

-- Enable RLS
ALTER TABLE job_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can insert their own jobs"
  ON job_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON job_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own jobs"
  ON job_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_job_tracking_updated_at
BEFORE UPDATE ON job_tracking
FOR EACH ROW
EXECUTE FUNCTION update_job_tracking_updated_at();
