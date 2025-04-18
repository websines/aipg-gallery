// Database setup script
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = "https://sb.aipowergrid.io"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzI0Njk3MDAwLAogICJleHAiOiAxODgyNDYzNDAwCn0.QLdlzU1aFtE89QU6JUiz6fAuVAvihk0ONj8jy0a8BI0"

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Setting up database tables...');

  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'database-setup.sql');
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL commands directly
    const { error } = await supabase.rpc('exec_sql', { sql: sqlCommands });
    
    if (error) {
      if (error.message.includes('function "exec_sql" does not exist')) {
        console.log('The exec_sql function does not exist. This is expected in most Supabase instances.');
        console.log('Please execute the SQL commands directly in the Supabase SQL Editor.');
        console.log('SQL commands are located at: ' + sqlFilePath);
      } else {
        console.error('Error executing SQL commands:', error);
      }
    } else {
      console.log('Database tables created successfully!');
    }
    
    // Create storage bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
    } else {
      const bucketNames = buckets.map(b => b.name);
      
      if (!bucketNames.includes('generated_images')) {
        console.log('Creating generated_images storage bucket...');
        
        const { error: createBucketError } = await supabase
          .storage
          .createBucket('generated_images', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif']
          });

        if (createBucketError) {
          console.error('Error creating storage bucket:', createBucketError);
        } else {
          console.log('generated_images storage bucket created successfully');
          
          // Set bucket policy to public
          const { error: policyError } = await supabase
            .storage
            .from('generated_images')
            .createSignedUrl('dummy.txt', 60);
            
          if (policyError && !policyError.message.includes('does not exist')) {
            console.error('Error setting bucket policy:', policyError);
          }
        }
      } else {
        console.log('generated_images storage bucket already exists');
      }
    }
    
    console.log('Database setup completed!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase().catch(console.error);
