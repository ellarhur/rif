import React, { useState } from 'react'
// import logoTransparent from '../assets/logotransparent.png'
import '../styles/RifDashboard.scss'
import WhatIsRif from './WhatIsRif'
import CreateNewProject from './CreateNewProject'
import YourProjects from './YourProjects'
import AddSoundbiteButton from './AddSoundbiteButton'
import Searchbox from './Searchbox'
import Navbar from './Navbar'

const RifDashboard = () => {
  const [isWhatIsRifOpen, setIsWhatIsRifOpen] = useState(false)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [isAddSoundbiteOpen, setIsAddSoundbiteOpen] = useState(false)
  const registeredTitles = ['Midnight Echo', 'Project #1 Demo', 'Rif Theme v2']

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        
        <div className="dashboard-headerInner">
          {/* <img src={logoTransparent} alt="Rif logo" /> */}
          <h1>Rif.</h1>
        </div>
        <Navbar />

      </header>
      <h2 className="dashboard-headline">Welcome back, loggedinuser. What do you wanna do today?</h2>

      <main className="dashboard-main">
        <aside className="dashboard-left">
          <YourProjects onCreateProject={() => setIsCreateProjectOpen(true)} />
        </aside>

        <section className="dashboard-actions">
          <button onClick={() => setIsAddSoundbiteOpen(true)}>Add soundbite to a project</button>
          <button onClick={() => setIsWhatIsRifOpen(true)}>What is Rif?</button>
        </section>

        <aside className="dashboard-right">
          <Searchbox titles={registeredTitles} />
        </aside>
      </main>

      <footer className="dashboard-footer">Concept & development by Ella, 2026.</footer>

      {isCreateProjectOpen && <CreateNewProject onClose={() => setIsCreateProjectOpen(false)} />}
      {isAddSoundbiteOpen && <AddSoundbiteButton onClose={() => setIsAddSoundbiteOpen(false)} />}
      {isWhatIsRifOpen && <WhatIsRif onClose={() => setIsWhatIsRifOpen(false)} />}
    </div>
  )
}

export default RifDashboard
