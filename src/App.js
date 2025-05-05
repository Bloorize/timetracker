import React, { useState, useEffect } from 'react';
import './App.css';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import Reporting from './components/Reporting';
import { getProjects, createProject, getProjectWithTasks, createTask, updateTask, deleteTask, deleteProject, saveActiveTask, getActiveTask, clearActiveTask } from './utils/supabase';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import { useAuth } from './context/AuthContext';

function App() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [activeTaskProjectId, setActiveTaskProjectId] = useState(null);
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [timerInterval, setTimerInterval] = useState(null);
  const [currentView, setCurrentView] = useState('timer'); // 'timer' or 'reports'
  const { user, loading, isAuthenticated } = useAuth();

  // Load data from Supabase on initial render
  useEffect(() => {
    if (!user) {
      console.log('No user authenticated, skipping data load');
      return;
    }

    console.log('Loading data for user:', user.id);

    const loadData = async () => {
      try {
        // Load projects
        const { data: projectsData, error: projectsError } = await getProjects();
        
        if (projectsError) {
          console.error('Error loading projects:', projectsError);
          throw projectsError;
        }
        
        console.log('Projects loaded:', projectsData);
        
        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData);
          setSelectedProjectId(projectsData[0].id);
          
          // Load tasks for the first project
          const { data: projectWithTasks, error: tasksError } = await getProjectWithTasks(projectsData[0].id);
          
          if (tasksError) {
            console.error('Error loading tasks:', tasksError);
          }
          
          if (projectWithTasks) {
            console.log('Tasks loaded for project:', projectWithTasks);
            // Update the projects array with the tasks
            setProjects(prevProjects => 
              prevProjects.map(project => 
                project.id === projectWithTasks.id 
                  ? {
                      ...projectWithTasks,
                      tasks: projectWithTasks.tasks.map(task => ({
                        id: task.id,
                        name: task.name,
                        timeSpent: task.time_spent || 0,
                        createdAt: task.created_at
                      }))
                    } 
                  : project
              )
            );
          }
        } else {
          // No projects were found for this user
          console.log('No projects found for user. User ID:', user.id);
          setProjects([]);
          setSelectedProjectId(null);
        }

        // Check for active task
        const { data: activeTask } = await getActiveTask();
        if (activeTask) {
          setActiveTaskId(activeTask.taskId);
          setActiveTaskProjectId(activeTask.projectId);
          setTimerStartTime(parseInt(activeTask.startTime));
          
          // Resume timer
          startTimerInterval(activeTask.taskId, activeTask.projectId, parseInt(activeTask.startTime));
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      }
    };

    loadData();
    
    // Clean up interval on unmount
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Add a new project
  const handleAddProject = async (projectData) => {
    console.log('handleAddProject called with:', projectData);
    try {
      const { data: newProject, error } = await createProject({
        name: projectData.name,
        description: projectData.description
      });
      
      console.log('createProject returned:', { newProject, error });
      
      if (error) {
        console.error('Error details:', error);
        throw error;
      }
      
      if (newProject) {
        console.log('Setting projects state with new project:', newProject);
        setProjects(prevProjects => {
          const updatedProjects = [...prevProjects, { ...newProject, tasks: [] }];
          console.log('Updated projects state:', updatedProjects);
          return updatedProjects;
        });
        setSelectedProjectId(newProject.id);
      } else {
        console.warn('No project returned from createProject');
      }
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  // Add a task to a project
  const handleAddTask = async (projectId, taskData) => {
    try {
      const { data: newTask, error } = await createTask({
        project_id: projectId,
        name: taskData.name,
        time_spent: 0
      });
      
      if (error) throw error;
      
      if (newTask) {
        // Update local state
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project.id === projectId 
              ? { 
                  ...project, 
                  tasks: [...(project.tasks || []), 
                    { 
                      id: newTask.id,
                      name: newTask.name,
                      timeSpent: newTask.time_spent || 0,
                      createdAt: newTask.created_at
                    }
                  ] 
                } 
              : project
          )
        );
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Start the timer for a task
  const handleStartTimer = async (taskId) => {
    // Stop any currently running timer
    if (activeTaskId) {
      await handleStopTimer(activeTaskId);
    }
    
    const projectId = selectedProjectId;
    const startTime = Date.now();
    
    setActiveTaskId(taskId);
    setActiveTaskProjectId(projectId);
    setTimerStartTime(startTime);
    
    // Save active task to Supabase
    await saveActiveTask({
      taskId,
      projectId,
      startTime
    });
    
    // Start timer interval
    startTimerInterval(taskId, projectId, startTime);
  };

  // Stop the timer for a task
  const handleStopTimer = async (taskId) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    if (timerStartTime) {
      // Calculate elapsed time in seconds
      const elapsedSeconds = Math.floor((Date.now() - timerStartTime) / 1000);
      
      try {
        // Find the current task to get its current time
        const taskProject = projects.find(project => 
          project.id === activeTaskProjectId && 
          project.tasks && 
          Array.isArray(project.tasks) &&
          project.tasks.some(task => task.id === taskId)
        );
        
        if (taskProject) {
          const task = taskProject.tasks.find(t => t.id === taskId);
          const updatedTimeSpent = task.timeSpent + elapsedSeconds;
          
          // Update task in Supabase
          const { error } = await updateTask(taskId, {
            time_spent: updatedTimeSpent
          });
          
          if (error) throw error;
          
          // Update local state
          setProjects(prevProjects => 
            prevProjects.map(project => 
              project.id === activeTaskProjectId 
                ? {
                    ...project,
                    tasks: project.tasks && Array.isArray(project.tasks)
                      ? project.tasks.map(task => 
                          task.id === taskId 
                            ? { ...task, timeSpent: updatedTimeSpent } 
                            : task
                        )
                      : []
                  } 
                : project
            )
          );
        }
      } catch (error) {
        console.error('Error updating task time:', error);
      }
    }
    
    // Clear active task from state and Supabase
    setActiveTaskId(null);
    setActiveTaskProjectId(null);
    setTimerStartTime(null);
    await clearActiveTask();
  };

  // Timer interval function
  const startTimerInterval = (taskId, projectId, startTime) => {
    const interval = setInterval(() => {
      // We'll update the UI more frequently than the database
      // eslint-disable-next-line no-unused-vars
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      
      // Update the task's time spent in real-time for display purposes only
      setProjects(prevProjects => 
        prevProjects.map(project => {
          if (project.id === projectId) {
            if (!project.tasks || !Array.isArray(project.tasks)) {
              return {
                ...project,
                tasks: []
              };
            }
            
            return {
              ...project,
              tasks: project.tasks.map(task => 
                task.id === taskId 
                  ? { ...task, timeSpent: task.timeSpent + 1 } 
                  : task
              )
            };
          }
          return project;
        })
      );
    }, 1000);
    
    setTimerInterval(interval);
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    // If this task is being timed, stop the timer first
    if (activeTaskId === taskId) {
      await handleStopTimer(taskId);
    }
    
    try {
      const { error } = await deleteTask(taskId);
      if (error) throw error;
      
      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(project => ({
          ...project,
          tasks: project.tasks && Array.isArray(project.tasks)
            ? project.tasks.filter(task => task.id !== taskId)
            : []
        }))
      );
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Update task time
  const handleUpdateTaskTime = async (taskId, newTimeInSeconds, selectedDate = null) => {
    try {
      // Find the project that contains this task
      const projectWithTask = projects.find(project => 
        project.tasks && 
        Array.isArray(project.tasks) &&
        project.tasks.some(task => task.id === taskId)
      );
      
      if (projectWithTask) {
        // If a date was selected, log this as a time entry for that date
        if (selectedDate) {
          console.log(`Logging time for task ${taskId} on ${selectedDate.toISOString().split('T')[0]}: ${newTimeInSeconds} seconds`);
          
          // TODO: In a full implementation, you would save this to a separate time_entries table
          // For now, just update the total time on the task
        }
        
        // Update in Supabase
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
                  tasks: project.tasks && Array.isArray(project.tasks)
                    ? project.tasks.map(task => 
                        task.id === taskId 
                          ? { ...task, timeSpent: newTimeInSeconds } 
                          : task
                      )
                    : []
                } 
              : project
          )
        );
      }
    } catch (error) {
      console.error('Error updating task time:', error);
    }
  };

  // Delete a project
  const handleDeleteProject = async (projectId) => {
    // If there's an active task associated with this project, stop it first
    if (activeTaskProjectId === projectId && activeTaskId) {
      await handleStopTimer(activeTaskId);
    }
    
    try {
      const { error } = await deleteProject(projectId);
      if (error) throw error;
      
      // Update local state
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
      
      // If this was the selected project, select another project if available
      if (selectedProjectId === projectId) {
        const remainingProjects = projects.filter(project => project.id !== projectId);
        if (remainingProjects.length > 0) {
          setSelectedProjectId(remainingProjects[0].id);
        } else {
          setSelectedProjectId(null);
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  // Get the selected project
  const selectedProject = projects.find(project => project.id === selectedProjectId);

  // If Supabase is not configured, we'll show this message
  if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
    return (
      <div className="App">
        <div style={{ maxWidth: '800px', margin: '100px auto', padding: '20px', textAlign: 'center' }}>
          <h1 className="app-logo">time<span>tracker</span></h1>
          <div className="card" style={{ marginTop: '20px', padding: '20px' }}>
            <h2>Supabase Configuration Missing</h2>
            <p>To use this application, you need to set up your Supabase credentials.</p>
            <ol style={{ textAlign: 'left', display: 'inline-block' }}>
              <li>Create a <code>.env.local</code> file in the root directory</li>
              <li>Add the following lines to the file:</li>
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '5px',
                textAlign: 'left' 
              }}>
                REACT_APP_SUPABASE_URL=your_supabase_url<br/>
                REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
              </pre>
              <li>Replace the placeholders with your actual Supabase credentials</li>
              <li>Restart the development server</li>
            </ol>
            <p>See the README.md file for complete setup instructions.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onAuth={() => {}} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="app-logo">time<span>tracker</span></h1>
        <div className="header-right">
          <nav className="nav-links">
            <a 
              href="#timer" 
              className={`nav-link ${currentView === 'timer' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentView('timer');
              }}
            >
              Timer
            </a>
            <a 
              href="#reports" 
              className={`nav-link ${currentView === 'reports' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setCurrentView('reports');
              }}
            >
              Reports
            </a>
          </nav>
          <UserProfile onAuthChange={() => {}} />
        </div>
      </header>
      
      {currentView === 'timer' ? (
        <main className="main-content">
          <ProjectList 
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
          />
          
          <ProjectDetail 
            project={selectedProject}
            onAddTask={handleAddTask}
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskTime={handleUpdateTaskTime}
            onDeleteProject={handleDeleteProject}
            activeTaskId={activeTaskId}
          />
        </main>
      ) : (
        <main>
          <Reporting projects={projects} />
        </main>
      )}
    </div>
  );
}

export default App;
