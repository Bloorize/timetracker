import React, { useState } from 'react';
import TaskItem from './TaskItem';

const ProjectDetail = ({ 
  project, 
  onAddTask, 
  onStartTimer, 
  onStopTimer, 
  onDeleteTask, 
  onUpdateTaskTime,
  onDeleteProject,
  activeTaskId 
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      onAddTask(project.id, { name: newTaskName });
      setNewTaskName('');
    }
  };
  
  if (!project) {
    return (
      <div className="project-detail">
        <div className="card">
          <h2>Select a project or create a new one</h2>
          <p>Projects help you organize your tasks and track time efficiently.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="project-detail">
      <div className="project-header">
        <div>
          <h1>{project.name}</h1>
          {project.description && <p>{project.description}</p>}
        </div>
        <div className="project-actions">
          <div className="timer-info">
            <div className="subject-line">Total time: {formatTotalTime(project.tasks)}</div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="section-title mb-md">Add New Task</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Enter task name"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <button type="submit" className="btn btn-primary">Add Task</button>
          </div>
        </form>
      </div>
      
      <div className="card project-tasks">
        <h3 className="section-title mb-md">Tasks</h3>
        {!project.tasks || project.tasks.length === 0 ? (
          <p>No tasks yet. Add your first task to start tracking time.</p>
        ) : (
          project.tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onStartTimer={onStartTimer}
              onStopTimer={onStopTimer}
              onDeleteTask={onDeleteTask}
              onUpdateTaskTime={onUpdateTaskTime}
              activeTaskId={activeTaskId}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Helper function to format total time
const formatTotalTime = (tasks) => {
  if (!tasks || !Array.isArray(tasks)) {
    return '0h 0m';
  }
  
  const totalSeconds = tasks.reduce((total, task) => total + task.timeSpent, 0);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  return `${hours}h ${minutes}m`;
};

export default ProjectDetail; 