// Script to create a new user in Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createUser() {
  try {
    return new Promise((resolve) => {
      rl.question('Enter email: ', (email) => {
        rl.question('Enter password: ', async (password) => {
          rl.question('Enter full name (optional): ', async (fullName) => {
            console.log(`Creating user with email: ${email}...`);
            
            // Sign up the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: fullName || '',
                }
              }
            });
            
            if (authError) {
              console.error('Error creating user:', authError);
              rl.close();
              resolve();
              return;
            }
            
            console.log(`User created successfully! User ID: ${authData.user.id}`);
            console.log('A confirmation email has been sent.');
            
            // Create a profile for the user
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: authData.user.id,
                username: email.split('@')[0],
                full_name: fullName || '',
              }]);
              
            if (profileError) {
              console.error('Error creating profile:', profileError);
            } else {
              console.log('Profile created successfully!');
            }
            
            rl.close();
            resolve();
          });
        });
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    rl.close();
  }
}

createUser().then(() => {
  console.log('User creation process completed.');
}); 