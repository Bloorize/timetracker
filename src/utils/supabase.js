import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if the environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Error: Supabase environment variables are missing. Make sure you have set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.'
  );
}

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  // Make Supabase available globally
  window.supabase = supabase;
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a mock Supabase client to prevent crashes
  supabase = {
    auth: {
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null } }),
      getUser: () => Promise.resolve({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { unsubscribe: () => {} } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      delete: () => Promise.resolve({ error: null }),
      order: () => ({ data: null, error: null })
    })
  };
}

/**
 * Sign up with email and password
 */
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) return { error };
    
    return {
      user: data.user,
      error: null
    };
  } catch (err) {
    return { error: err };
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return { error };
    
    return {
      user: data.user,
      session: data.session,
      error: null
    };
  } catch (err) {
    return { error: err };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Check if there is an active session
 */
export const checkSession = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // You can fetch additional user data from your profiles table if needed
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return {
    ...user,
    profile: profile || null
  };
};

/**
 * Update a user's profile
 */
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
    
  if (error) throw error;
  return data;
};

export default supabase;

// Projects CRUD operations

// Get all projects for the current user
export const getProjects = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: new Error('Not authenticated') };
  
  console.log('getProjects - Getting projects for user:', user.id);
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  console.log('getProjects - Result:', { data, error });
  
  return { data, error };
};

// Get a specific project with its tasks
export const getProjectWithTasks = async (projectId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();
  
  if (projectError) return { data: null, error: projectError };
  
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  
  if (tasksError) return { data: null, error: tasksError };
  
  return { 
    data: { ...project, tasks: tasks || [] }, 
    error: null 
  };
};

// Create a new project
export const createProject = async (projectData) => {
  console.log('Creating project with data:', projectData);
  
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current user:', user);
  
  if (!user) return { data: null, error: new Error('Not authenticated') };
  
  const { data, error } = await supabase
    .from('projects')
    .insert([{ ...projectData, user_id: user.id }])
    .select()
    .single();
  
  console.log('Project creation result:', { data, error });
  
  return { data, error };
};

// Update a project
export const updateProject = async (projectId, projectData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };
  
  const { data, error } = await supabase
    .from('projects')
    .update(projectData)
    .eq('id', projectId)
    .eq('user_id', user.id)
    .select()
    .single();
  
  return { data, error };
};

// Delete a project
export const deleteProject = async (projectId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Not authenticated') };
  
  // First delete all tasks associated with the project
  const { error: tasksError } = await supabase
    .from('tasks')
    .delete()
    .eq('project_id', projectId);
  
  if (tasksError) return { error: tasksError };
  
  // Then delete the project
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id);
  
  return { error };
};

// Tasks CRUD operations

// Get all tasks for a project
export const getTasks = async (projectId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  
  return { data, error };
};

// Create a new task
export const createTask = async (taskData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };
  
  // Verify this project belongs to the user
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', taskData.project_id)
    .eq('user_id', user.id)
    .single();
    
  if (projectError || !project) {
    console.error('Project not found or does not belong to user', projectError);
    return { data: null, error: projectError || new Error('Project not found') };
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .insert([taskData])
    .select()
    .single();
  
  return { data, error };
};

// Update a task
export const updateTask = async (taskId, taskData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };
  
  // First verify that this task belongs to a project owned by the user
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', taskId)
    .single();
    
  if (taskError || !task) {
    console.error('Task not found', taskError);
    return { data: null, error: taskError || new Error('Task not found') };
  }
  
  // Verify the project belongs to the user
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', task.project_id)
    .eq('user_id', user.id)
    .single();
    
  if (projectError || !project) {
    console.error('Project not found or does not belong to user', projectError);
    return { data: null, error: projectError || new Error('Not authorized to update this task') };
  }
  
  // Now update the task
  const { data, error } = await supabase
    .from('tasks')
    .update(taskData)
    .eq('id', taskId)
    .select()
    .single();
  
  return { data, error };
};

// Delete a task
export const deleteTask = async (taskId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Not authenticated') };
  
  // First verify that this task belongs to a project owned by the user
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', taskId)
    .single();
    
  if (taskError || !task) {
    console.error('Task not found', taskError);
    return { error: taskError || new Error('Task not found') };
  }
  
  // Verify the project belongs to the user
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', task.project_id)
    .eq('user_id', user.id)
    .single();
    
  if (projectError || !project) {
    console.error('Project not found or does not belong to user', projectError);
    return { error: projectError || new Error('Not authorized to delete this task') };
  }
  
  // Now delete the task
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  return { error };
};

// Active task operations

// Save active task
export const saveActiveTask = async (activeTaskData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Not authenticated') };
  
  // First check if there's already an active task for this user
  const { data: existingTask } = await supabase
    .from('active_tasks')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (existingTask) {
    // Update existing active task
    const { error } = await supabase
      .from('active_tasks')
      .update({
        task_id: activeTaskData.taskId,
        project_id: activeTaskData.projectId,
        start_time: activeTaskData.startTime,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
    
    return { error };
  } else {
    // Create new active task
    const { error } = await supabase
      .from('active_tasks')
      .insert([{
        user_id: user.id,
        task_id: activeTaskData.taskId,
        project_id: activeTaskData.projectId,
        start_time: activeTaskData.startTime,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    
    return { error };
  }
};

// Get active task
export const getActiveTask = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };
  
  const { data, error } = await supabase
    .from('active_tasks')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (data) {
    return {
      data: {
        taskId: data.task_id,
        projectId: data.project_id,
        startTime: data.start_time
      },
      error
    };
  }
  
  return { data: null, error };
};

// Clear active task
export const clearActiveTask = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Not authenticated') };
  
  const { error } = await supabase
    .from('active_tasks')
    .delete()
    .eq('user_id', user.id);
  
  return { error };
};

export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw error;
}; 