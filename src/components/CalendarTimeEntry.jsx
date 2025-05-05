import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const CalendarTimeEntry = ({ 
  isOpen, 
  onClose, 
  onSaveTime, 
  task, 
  currentTime 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeInput, setTimeInput] = useState(formatTime(currentTime || 0));
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const seconds = parseTimeInput(timeInput);
    if (seconds === null) {
      setError('Please use HH:MM:SS or HH:MM format for time input.');
      return;
    }
    
    onSaveTime(task.id, seconds, selectedDate);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Enter Time for {task.name}</h3>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group mb-md">
            <label htmlFor="datePicker">Select Date:</label>
            <DatePicker
              id="datePicker"
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              className="form-control"
              maxDate={new Date()}
            />
          </div>
          <div className="form-group">
            <label htmlFor="timeInput">Enter Time:</label>
            <input
              id="timeInput"
              type="text"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
              placeholder="HH:MM:SS"
              className="form-control"
            />
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>
        <div className="modal-footer">
          <button 
            className="btn" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
          >
            Save Time
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarTimeEntry; 