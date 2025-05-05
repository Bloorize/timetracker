// Keys for localStorage
const PROJECTS_KEY = 'timeTracker_projects';
const ACTIVE_TASK_KEY = 'timeTracker_activeTask';

// Save projects to localStorage
export const saveProjects = (projects) => {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects to localStorage:', error);
  }
};

// Load projects from localStorage
export const loadProjects = () => {
  try {
    const projectsJson = localStorage.getItem(PROJECTS_KEY);
    return projectsJson ? JSON.parse(projectsJson) : [];
  } catch (error) {
    console.error('Error loading projects from localStorage:', error);
    return [];
  }
};

// Save active task info
export const saveActiveTask = (taskInfo) => {
  try {
    localStorage.setItem(ACTIVE_TASK_KEY, JSON.stringify(taskInfo));
  } catch (error) {
    console.error('Error saving active task to localStorage:', error);
  }
};

// Load active task info
export const loadActiveTask = () => {
  try {
    const taskInfoJson = localStorage.getItem(ACTIVE_TASK_KEY);
    return taskInfoJson ? JSON.parse(taskInfoJson) : null;
  } catch (error) {
    console.error('Error loading active task from localStorage:', error);
    return null;
  }
};

// Clear active task
export const clearActiveTask = () => {
  try {
    localStorage.removeItem(ACTIVE_TASK_KEY);
  } catch (error) {
    console.error('Error clearing active task from localStorage:', error);
  }
}; 