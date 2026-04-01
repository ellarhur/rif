import React from 'react'

const YourProjects = ( ) => {
  const projectItems = ['Project #1', 'Project #2']

  return (
    <div className="yourprojects-panel">
      <h1>Your projects</h1>
            {projectItems.map((projectName) => (
        <button key={projectName}>{projectName}</button>
      ))}
    </div>
  )
}

export default YourProjects
