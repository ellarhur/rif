import React, { useState } from 'react'
import logoTransparent from '../assets/logotransparent.png'
import '../styles/RifDashboard.scss'
import WhatIsRif from './WhatIsRif'
import CreateNewProject from './CreateNewProject'

const RifDashboard = () => {
  const [isWhatIsRifOpen, setIsWhatIsRifOpen] = useState(false)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)

  return (
    <div className="dashboard-page">
      <div className="brand">
        <img src={logoTransparent} alt="Rif logo" />
      </div>

      <main className="dashboard-main">
        <section className="dashboard-actions">
          <button onClick={() => setIsCreateProjectOpen(true)}>Create a new project</button>
          <button onClick={() => setIsWhatIsRifOpen(true)}>What is Rif?</button>
        </section>

        <aside className="projects-panel">
          <h2>Your projects</h2>
          <button>Project #1</button>
          <button>Project #2</button>
        </aside>
      </main>

      <footer className="dashboard-footer">Concept & development by Ella, 2026.</footer>

      {isCreateProjectOpen && <CreateNewProject onClose={() => setIsCreateProjectOpen(false)} />}
      {isWhatIsRifOpen && <WhatIsRif onClose={() => setIsWhatIsRifOpen(false)} />}
    </div>
  )
}

export default RifDashboard
