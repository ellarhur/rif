import React from 'react'
import logoTransparent from '../assets/logotransparent.png'
import '../styles/RifDashboard.scss'

const RifDashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="brand">
      <img src={logoTransparent} alt="Rif logo" />
      </div>

      <main className="dashboard-main">
        <section className="dashboard-actions">
          <button>Create a new project</button>
          <button>What is Rif?</button>
        </section>

        <aside className="projects-panel">
          <h2>Your projects</h2>
          <button>Project #1</button>
          <button>Project #2</button>
        </aside>
      </main>

      <footer className="dashboard-footer">Concept & development by Ella, 2026.</footer>
    </div>
  )
}

export default RifDashboard
