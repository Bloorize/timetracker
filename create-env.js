const fs = require('fs');
const path = require('path');

// Check if .env.local already exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('\x1b[33m%s\x1b[0m', 'Warning: .env.local already exists. Skipping creation to avoid overwriting existing credentials.');
  process.exit(0);
}

// Create the .env.local file with placeholder values
const envContent = `REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key`;

fs.writeFileSync(envPath, envContent);

console.log('\x1b[32m%s\x1b[0m', '.env.local file created successfully!');
console.log('\x1b[36m%s\x1b[0m', 'Please edit the file with your actual Supabase credentials:');
console.log('\x1b[0m', `- Replace 'your_supabase_url' with your Supabase project URL`);
console.log('\x1b[0m', `- Replace 'your_supabase_anon_key' with your Supabase anonymous key`);
console.log('\x1b[33m%s\x1b[0m', 'After editing, restart the development server.'); 