import React from 'react'

const CreateNewProject = ({ onClose }) => {
  return (
    <div className="createnewproject-overlay" onClick={onClose} role="presentation">
      <div
        className="createnewproject-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="createnewproject-title"
      >
        <button className="createnewproject-close" onClick={onClose} aria-label="Close modal">
          x
        </button>
        <h1 id="createnewproject-title">Create New Project</h1>
        <p>Create a new project to start your creative journey.</p>
        <input type="text" placeholder="Project Name" />
        <input type="text" placeholder="Project Description" />
        <input type="file" />
        <input type="file" />

        <button onClick={onClose}>Cancel</button>
        <button onClick={onClose}>Create Project</button>
      </div>
    </div>
  )
}

export default CreateNewProject
