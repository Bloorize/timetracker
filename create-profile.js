// Script to create a profile for the current authenticated user
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUserProfile() {
  try {
    console.log('Checking for current user...');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw userError;
    }
    
    if (!user) {
      console.error('No authenticated user found. Please log in first.');
      return;
    }
    
    console.log(`Found user: ${user.email} (ID: ${user.id})`);
    
    // Check if profile already exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "Did not find any rows" error
      throw profileError;
    }
    
    if (existingProfile) {
      console.log(`Profile already exists for user ${user.email}`);
      return;
    }
    
    // Create profile for user
    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        username: user.email.split('@')[0],
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || ''
      }])
      .select();
    
    if (insertError) {
      throw insertError;
    }
    
    console.log(`Profile created successfully for user ${user.email}`);
    
  } catch (error) {
    console.error('Error creating profile:', error);
  }
}

createUserProfile(); 