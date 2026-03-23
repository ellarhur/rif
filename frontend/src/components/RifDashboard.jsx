import React from 'react'

const RifDashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="brand">
        <h1>Rif.</h1>
        <p>Proof of creative process.</p>
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
