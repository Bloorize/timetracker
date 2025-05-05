-- Time entries table for date-based time tracking
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  entry_date DATE NOT NULL,
  duration INTEGER NOT NULL, -- time in seconds
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT
);

-- Enable Row Level Security for time_entries
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to view and edit their own time entries
CREATE POLICY "Users can view and edit their own time entries"
  ON public.time_entries
  FOR ALL
  USING (auth.uid() = user_id);

-- Add an index for efficient date-based queries
CREATE INDEX IF NOT EXISTS time_entries_date_idx ON public.time_entries (entry_date);

-- Add an index for efficient user-based queries
CREATE INDEX IF NOT EXISTS time_entries_user_idx ON public.time_entries (user_id);

-- Add an index for efficient task-based queries
CREATE INDEX IF NOT EXISTS time_entries_task_idx ON public.time_entries (task_id);

-- Add an index for efficient project-based queries  
CREATE INDEX IF NOT EXISTS time_entries_project_idx ON public.time_entries (project_id);

-- Note: Run this SQL file to add the time_entries table for date-based time tracking
-- This allows recording time entries for specific dates, which is useful for:
-- 1. Tracking time retroactively (adding time for past days)
-- 2. Generating more detailed reports by date
-- 3. Supporting the calendar feature for time entry

-- To run this file, use the Supabase SQL editor or connect to your database
-- and execute this SQL. 