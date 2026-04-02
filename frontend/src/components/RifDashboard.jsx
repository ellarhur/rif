import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import logoTransparent from '../assets/logotransparent.png'
import '../styles/RifDashboard.scss'
import WhatIsRif from './WhatIsRif'
import CreateNewProject from './CreateNewProject'
import CreateNewProjectResult from './CreateNewProjectResult'
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
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0)
  const [createResult, setCreateResult] = useState(null)
  
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
          <YourProjects refreshKey={projectsRefreshKey} />
        </aside>

        <aside className="dashboard-right">
          <div className="dashboard-right-actions">
            <button type="button" onClick={() => setIsCreateProjectOpen(true)}>
              Create a new project
            </button>
            <button type="button" onClick={() => setIsAddSoundbiteOpen(true)}>
              Add soundbite to a project
            </button>
          </div>
          <Searchbox />
        </aside>
      </main>

      <footer className="dashboard-footer">Concept & development by Ella, 2026.</footer>

      {isCreateProjectOpen && (
        <CreateNewProject
          onClose={() => setIsCreateProjectOpen(false)}
          onCreated={(result) => {
            setIsCreateProjectOpen(false)
            setCreateResult(result)
          }}
          onSuccess={() => setProjectsRefreshKey((k) => k + 1)}
        />
      )}
      {createResult && (
        <CreateNewProjectResult
          result={createResult}
          onClose={() => setCreateResult(null)}
        />
      )}
      {isAddSoundbiteOpen && <AddSoundbiteButton onClose={() => setIsAddSoundbiteOpen(false)} />}
      {isWhatIsRifOpen && <WhatIsRif onClose={() => setIsWhatIsRifOpen(false)} />}
    </div>
  )
}

export default RifDashboard
