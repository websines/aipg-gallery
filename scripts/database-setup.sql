-- Create extension for UUID generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create image_metadata table
CREATE TABLE IF NOT EXISTS image_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  positive_prompt TEXT NOT NULL,
  negative_prompt TEXT,
  sampler TEXT,
  model TEXT,
  guidance NUMERIC,
  public_view BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create image_data table
CREATE TABLE IF NOT EXISTS image_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  seed TEXT,
  metadata_id UUID REFERENCES image_metadata(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for image_metadata
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own metadata"
  ON image_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metadata"
  ON image_metadata FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metadata"
  ON image_metadata FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own metadata"
  ON image_metadata FOR SELECT
  USING (auth.uid() = user_id OR public_view = TRUE);

-- Create RLS policies for image_data
ALTER TABLE image_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert image data for their metadata"
  ON image_data FOR INSERT
  WITH CHECK (
    metadata_id IN (
      SELECT id FROM image_metadata WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update image data for their metadata"
  ON image_data FOR UPDATE
  USING (
    metadata_id IN (
      SELECT id FROM image_metadata WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete image data for their metadata"
  ON image_data FOR DELETE
  USING (
    metadata_id IN (
      SELECT id FROM image_metadata WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view image data for their metadata or public metadata"
  ON image_data FOR SELECT
  USING (
    metadata_id IN (
      SELECT id FROM image_metadata WHERE user_id = auth.uid() OR public_view = TRUE
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS image_metadata_user_id_idx ON image_metadata(user_id);
CREATE INDEX IF NOT EXISTS image_data_metadata_id_idx ON image_data(metadata_id);
