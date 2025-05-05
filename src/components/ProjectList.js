import React, { useState } from 'react';
import Modal from './Modal';

const ProjectList = ({ projects, onSelectProject, onAddProject, onDeleteProject, selectedProjectId }) => {
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newProject.name.trim()) {
      onAddProject(newProject);
      setNewProject({ name: '', description: '' });
      setShowForm(false);
    }
  };

  const handleDeleteClick = (e, projectId) => {
    e.stopPropagation(); // Prevent item selection when clicking delete
    setProjectToDelete(projectId);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete);
      setModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setProjectToDelete(null);
  };

  return (
    <div className="sidebar">
      <h2 className="section-title mb-md">Projects</h2>
      
      <ul className="project-list">
        {projects.map(project => (
          <li 
            key={project.id} 
            className={`project-item ${selectedProjectId === project.id ? 'active' : ''}`}
          >
            <div 
              className="project-name"
              onClick={() => onSelectProject(project.id)}
            >
              {project.name}
            </div>
            <button 
              className="btn-delete" 
              onClick={(e) => handleDeleteClick(e, project.id)}
              aria-label="Delete project"
            >
              <span className="material-icons-outlined" style={{ fontSize: '16px' }}>delete</span>
            </button>
          </li>
        ))}
      </ul>
      
      <div className="add-project">
        {!showForm ? (
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowForm(true)}
          >
            Add New Project
          </button>
        ) : (
          <form className="project-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="projectName">Project Name</label>
              <input
                id="projectName"
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="projectDescription">Description (optional)</label>
              <textarea
                id="projectDescription"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-primary">Save Project</button>
            <button 
              type="button" 
              className="btn" 
              onClick={() => setShowForm(false)}
              style={{ marginLeft: '8px' }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      <Modal 
        isOpen={modalOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project and all its tasks? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default ProjectList; 