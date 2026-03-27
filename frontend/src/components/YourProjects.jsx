import React from 'react'

const YourProjects = ({ onCreateProject }) => {
  const projectItems = ['Project #1', 'Project #2']

  return (
    <div className="yourprojects-panel">
      <h1>Your projects</h1>
      <button onClick={onCreateProject}>Create a new project</button>
      {projectItems.map((projectName) => (
        <button key={projectName}>{projectName}</button>
      ))}
    </div>
  )
}

export default YourProjects
