import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import logoTransparent from '../assets/logotransparent.png'
import '../styles/RifDashboard.scss'
import CreateNewProject from './CreateNewProject'
import CreateNewProjectResult from './CreateNewProjectResult'
import YourProjects from './YourProjects'
import AddSoundbiteButton from './AddSoundbiteButton'
import ExploreProjects from './ExploreProjects'
import Navbar from './Navbar'
import { useWallet } from '../context/useWallet.js'
import { saveLocalSoundbite } from '../utils/rifSoundbiteRecords'
import '../styles/ProjectDetailModal.scss'
import '../styles/YourProjects.scss'

const RifDashboard = () => {
  const navigate = useNavigate()
  const { account } = useWallet()
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [isAddSoundbiteOpen, setIsAddSoundbiteOpen] = useState(false)
  const [isExploreOpen, setIsExploreOpen] = useState(false)
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
      <div className="dashboard-card">
        <h2 className="dashboard-headline">
         Hej! Skapa något kreativt.
        </h2>

        <main className="dashboard-main">
          <aside className="dashboard-left">
            <YourProjects refreshKey={projectsRefreshKey} />
          </aside>

          <aside className="dashboard-right">
            <div className="dashboard-right-actions">
              <button type="button" onClick={() => setIsCreateProjectOpen(true)}>
                Skapa ett nytt projekt
              </button>
              <button type="button" onClick={() => setIsAddSoundbiteOpen(true)}>
               Lägg till en soundbite
              </button>
              <button type="button" onClick={() => setIsExploreOpen(true)}>
                Utforska alla projekt
              </button>
            </div>
          </aside>
        </main>
      </div>


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
      {isAddSoundbiteOpen && (
        <AddSoundbiteButton
          onClose={() => setIsAddSoundbiteOpen(false)}
          onSave={(payload) => {
            // Spara lokalt också (bra som "draft/logg"), men on-chain sker i modalen.
            if (payload?.date && payload?.projectId && payload?.description) {
              saveLocalSoundbite(account, payload)
            }
            setProjectsRefreshKey((k) => k + 1)
          }}
        />
      )}
      {isExploreOpen && <ExploreProjects onClose={() => setIsExploreOpen(false)} />}
    </div>
  )
}

export default RifDashboard
