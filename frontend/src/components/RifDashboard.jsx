import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import logoTransparent from '../assets/logotransparent.png'
import '../styles/RifDashboard.scss'
import WhatIsRif from './WhatIsRif'
import CreateNewProject from './CreateNewProject'
import YourProjects from './YourProjects'
import AddSoundbiteButton from './AddSoundbiteButton'
import Searchbox from './Searchbox'
import Navbar from './Navbar'
import { useWallet } from '../context/WalletContext.jsx'

function shortAddress(addr) {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

const RifDashboard = () => {
  const navigate = useNavigate()
  const { account } = useWallet()
  const [isWhatIsRifOpen, setIsWhatIsRifOpen] = useState(false)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [isAddSoundbiteOpen, setIsAddSoundbiteOpen] = useState(false)
  const registeredTitles = ['Midnight Echo', 'Project #1 Demo', 'Rif Theme v2']

  useEffect(() => {
    if (!account) {
      navigate('/', { replace: true })
    }
  }, [account, navigate])

  if (!account) {
    return null
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-headerInner">
          {/* <img src={logoTransparent} alt="Rif logo" /> */}
          <h1 className="dashboard-headerLogo">Rif.</h1>
          <Navbar />
        </div>
      </header>
      <h2 className="dashboard-headline">
        Welcome back, {shortAddress(account)}. What do you wanna do today?
      </h2>

      <main className="dashboard-main">
        <aside className="dashboard-left">
          <YourProjects onCreateProject={() => setIsCreateProjectOpen(true)} />
        </aside>

        <section className="dashboard-actions">
          <button onClick={() => setIsCreateProjectOpen(true)}>Create a new project</button>
          <button onClick={() => setIsAddSoundbiteOpen(true)}>Add soundbite to a project</button>
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
