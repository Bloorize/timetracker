import React, { useState } from 'react';
import Modal from './Modal';
import CalendarTimeEntry from './CalendarTimeEntry';

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const parseTimeInput = (timeString) => {
  // Handle format HH:MM:SS or HH:MM
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    // HH:MM format
    return parts[0] * 3600 + parts[1] * 60;
  }
  
  return null; // Invalid format
};

const TaskItem = ({ 
  task, 
  onStartTimer, 
  onStopTimer, 
  onDeleteTask, 
  activeTaskId,
  onUpdateTaskTime
}) => {
  const isActive = activeTaskId === task.id;
  const [isEditing, setIsEditing] = useState(false);
  const [timeInput, setTimeInput] = useState(formatTime(task.timeSpent));
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  
  const handleEditClick = () => {
    setTimeInput(formatTime(task.timeSpent));
    setIsEditing(true);
  };
  
  const handleTimeChange = (e) => {
    setTimeInput(e.target.value);
  };
  
  const handleSaveTime = () => {
    const seconds = parseTimeInput(timeInput);
    if (seconds !== null) {
      onUpdateTaskTime(task.id, seconds);
      setIsEditing(false);
    } else {
      setErrorModalOpen(true);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTime();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTimeInput(formatTime(task.timeSpent));
    }
  };
  
  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDeleteTask(task.id);
    setDeleteModalOpen(false);
  };

  const handleCalendarClick = () => {
    setCalendarModalOpen(true);
  };

  const handleSaveCalendarTime = (taskId, seconds, date) => {
    // Here we pass the selected date along with the time
    onUpdateTaskTime(taskId, seconds, date);
  };

  return (
    <>
      <div className="task-item">
        <div className="task-name">{task.name}</div>
        <div className="task-time">
          {isEditing ? (
            <div className="time-edit">
              <input
                type="text"
                value={timeInput}
                onChange={handleTimeChange}
                onKeyDown={handleKeyDown}
                pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                placeholder="HH:MM:SS"
                autoFocus
                style={{ width: '100px' }}
              />
              <button className="btn btn-sm btn-primary" onClick={handleSaveTime}>
                Save
              </button>
              <button 
                className="btn btn-sm" 
                onClick={() => {
                  setIsEditing(false);
                  setTimeInput(formatTime(task.timeSpent));
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div 
              className="time-display" 
              onClick={!isActive ? handleEditClick : undefined}
              title={!isActive ? "Click to edit time" : "Stop timer to edit time"}
              style={{ cursor: !isActive ? 'pointer' : 'default' }}
            >
              {formatTime(task.timeSpent)}
              {!isActive && (
                <>
                  <button 
                    className="btn-edit-time" 
                    onClick={handleEditClick}
                    aria-label="Edit time"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-calendar" 
                    onClick={handleCalendarClick}
                    aria-label="Select date and time"
                    title="Select date and enter time"
                  >
                    📅
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="task-controls">
          {!isActive ? (
            <button 
              className="btn btn-success" 
              onClick={() => onStartTimer(task.id)}
              disabled={isEditing}
            >
              Start
            </button>
          ) : (
            <button 
              className="btn btn-danger" 
              onClick={() => onStopTimer(task.id)}
            >
              Stop
            </button>
          )}
          <button 
            className="btn" 
            onClick={handleDeleteClick}
            disabled={isEditing}
          >
            Delete
          </button>
        </div>
      </div>
      <Modal 
        isOpen={deleteModalOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
      <Modal 
        isOpen={errorModalOpen}
        title="Invalid Time Format"
        message="Please use HH:MM:SS or HH:MM format for time input."
        onConfirm={() => setErrorModalOpen(false)}
        onCancel={() => setErrorModalOpen(false)}
        confirmText="OK"
        confirmButtonClass="btn-primary"
        showCancelButton={false}
      />
      <CalendarTimeEntry
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        onSaveTime={handleSaveCalendarTime}
        task={task}
        currentTime={task.timeSpent}
      />
    </>
  );
};

export default TaskItem; 