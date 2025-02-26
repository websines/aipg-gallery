const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the directory of this script
const scriptDir = __dirname;

// Path to the SQL file
const sqlFilePath = path.join(scriptDir, 'api-key-table.sql');

// Read the SQL file
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Execute the SQL using psql
try {
  console.log('Running SQL script to update database...');
  
  // Get database connection details from environment variables
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  // Execute the SQL using psql
  execSync(`psql "${dbUrl}" -c "${sqlContent.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
  
  console.log('Database updated successfully');
} catch (error) {
  console.error('Error updating database:', error.message);
  process.exit(1);
}
