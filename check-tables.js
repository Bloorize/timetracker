// Script to check Supabase tables
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking Supabase tables...');
  
  try {
    // Check 'projects' table
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);
    
    if (projectsError) {
      console.error('Projects table error:', projectsError.message);
    } else {
      console.log('Projects table exists:', projects ? `Found ${projects.length} projects` : 'No projects');
    }
    
    // Check 'tasks' table
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(5);
    
    if (tasksError) {
      console.error('Tasks table error:', tasksError.message);
    } else {
      console.log('Tasks table exists:', tasks ? `Found ${tasks.length} tasks` : 'No tasks');
    }
    
    // Check 'active_tasks' table
    const { data: activeTasks, error: activeTasksError } = await supabase
      .from('active_tasks')
      .select('*')
      .limit(5);
    
    if (activeTasksError) {
      console.error('Active tasks table error:', activeTasksError.message);
    } else {
      console.log('Active tasks table exists:', activeTasks ? `Found ${activeTasks.length} active tasks` : 'No active tasks');
    }
    
    // Check 'profiles' table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('Profiles table error:', profilesError.message);
    } else {
      console.log('Profiles table exists:', profiles ? `Found ${profiles.length} profiles` : 'No profiles');
    }
    
    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error fetching user:', userError);
    } else if (user) {
      console.log('Current user:', `ID: ${user.id}, Email: ${user.email}`);
    } else {
      console.log('No user logged in');
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables(); 