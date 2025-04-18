// Database check script
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = "https://sb.aipowergrid.io"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzI0Njk3MDAwLAogICJleHAiOiAxODgyNDYzNDAwCn0.QLdlzU1aFtE89QU6JUiz6fAuVAvihk0ONj8jy0a8BI0"

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('Checking database tables...');

  try {
    // Check image_metadata table
    const { data: metadataData, error: metadataError } = await supabase
      .from('image_metadata')
      .select('id')
      .limit(1);

    if (metadataError) {
      console.error('Error checking image_metadata table:', metadataError);
      console.log('image_metadata table may not exist');
    } else {
      console.log('image_metadata table exists');
    }

    // Check image_data table
    const { data: imageData, error: imageDataError } = await supabase
      .from('image_data')
      .select('id')
      .limit(1);

    if (imageDataError) {
      console.error('Error checking image_data table:', imageDataError);
      console.log('image_data table may not exist');
    } else {
      console.log('image_data table exists');
    }

    // Check storage bucket
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
    } else {
      const bucketNames = buckets.map(b => b.name);
      
      if (bucketNames.includes('generated_images')) {
        console.log('generated_images storage bucket exists');
      } else {
        console.log('generated_images storage bucket does not exist');
      }
    }
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase().catch(console.error);
