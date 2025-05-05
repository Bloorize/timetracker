# Calendar Feature Implementation Guide

## Overview

The time tracker application now includes a calendar feature that allows users to enter time for specific dates. This is particularly useful for retroactive time tracking when users forget to log time on the day work was performed.

## Current Implementation

The current implementation includes:

1. A new `CalendarTimeEntry` component that provides:
   - Date selection via a calendar interface
   - Time input for the selected date
   - Modal interface for a clean user experience

2. Integration with the existing task management system:
   - Calendar button added to each task item
   - Updated `handleUpdateTaskTime` function in App.js to accept a date parameter
   - Basic logging of date information in the console

## Future Enhancement: Time Entries Table

For a complete implementation, the next step is to implement the `time_entries` table defined in `create-tables-v2.sql`. This will allow tracking individual time entries by date rather than just storing a total time value for each task.

### SQL Schema

The time_entries table schema is defined as:

```sql
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
```

### Implementation Steps

To complete the feature:

1. **Create the Table**: Execute the SQL in `create-tables-v2.sql` to create the time_entries table.

2. **Create Supabase API Functions**: Add new functions to `src/utils/supabase.js`:
   - `createTimeEntry(entryData)`
   - `getTimeEntriesByTask(taskId)`
   - `getTimeEntriesByDate(date, userId)`
   - `getTimeEntriesByDateRange(startDate, endDate, userId)`
   - `updateTimeEntry(entryId, entryData)`
   - `deleteTimeEntry(entryId)`

3. **Update App.js**: Modify the `handleUpdateTaskTime` function to:
   - Create a new time entry when a date is specified
   - Update the task's total time to maintain compatibility with the existing UI

4. **Update Reporting Component**: Enhance the reporting feature to:
   - Filter by date range
   - Show individual time entries when viewing task details
   - Display daily/weekly/monthly breakdowns of time

5. **Add Notes Feature**: Allow users to add notes to time entries for better context.

### Example Implementation for Creating Time Entries

Here's how the `handleUpdateTaskTime` function could be updated:

```javascript
const handleUpdateTaskTime = async (taskId, newTimeInSeconds, selectedDate = null) => {
  try {
    // Find the project that contains this task
    const projectWithTask = projects.find(project => 
      project.tasks?.some(task => task.id === taskId)
    );
    
    if (projectWithTask) {
      // If a date was selected, create a time entry for that date
      if (selectedDate) {
        const entryDate = selectedDate.toISOString().split('T')[0];
        const task = projectWithTask.tasks.find(t => t.id === taskId);
        
        // Create time entry
        const { data: entryData, error: entryError } = await createTimeEntry({
          entry_date: entryDate,
          duration: newTimeInSeconds,
          task_id: taskId,
          project_id: projectWithTask.id,
          notes: `Time added via calendar for ${task.name}`
        });
        
        if (entryError) throw entryError;
        console.log('Time entry created:', entryData);
      }
      
      // Update task total time in Supabase (for backward compatibility)
      const { error } = await updateTask(taskId, {
        time_spent: newTimeInSeconds
      });
      
      if (error) throw error;
      
      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectWithTask.id 
            ? {
                ...project,
                tasks: project.tasks.map(task => 
                  task.id === taskId 
                    ? { ...task, timeSpent: newTimeInSeconds } 
                    : task
                )
              } 
            : project
        )
      );
    }
  } catch (error) {
    console.error('Error updating task time:', error);
  }
};
```

## Technical Considerations

1. **Migration Strategy**: Consider how to migrate existing data to the new model. One approach is to create a script that generates time entries for existing tasks.

2. **Data Consistency**: Ensure that the sum of all time entries for a task matches the task's `time_spent` value for consistency.

3. **Optimistic Updates**: Update the UI immediately while the database operation happens in the background for a better user experience.

4. **Error Handling**: Provide appropriate feedback when time entry operations fail.

## User Experience Enhancements

1. **Visual Calendar View**: Show time entries on a calendar view with color-coding by project.

2. **Time Entry Templates**: Allow users to save common time entry patterns for quick application.

3. **Recurring Time Entries**: Support creating recurring time entries for routine tasks.

4. **Bulk Entry**: Enable entering time for multiple days or tasks at once.

## Conclusion

The calendar feature enhancement provides a significant improvement to the time tracking workflow, enabling more flexible and accurate time entry. The completed implementation with a dedicated time_entries table will provide a robust foundation for advanced reporting and time management features. 