// Startsida med MetaMask-inloggning och en expanderbar "Vad är Rif?"-sektion.
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import '../styles/LandingPage.scss'
import { useWallet } from '../context/useWallet.js'

const LandingPage = () => {
  const navigate = useNavigate()
  const {
    account,
    hasMetaMask,
    isConnecting,
    connectError,
    setConnectError,
    connectMetaMask,
  } = useWallet()
  const [rifOpen, setRifOpen] = useState(false)

  useEffect(() => {
    if (account) {
      navigate('/dashboard')
    }
  }, [account, navigate])

  return (
    <div className="landing-page">
      <h1>Rif</h1>
      <p>Proof of Creative Process</p>

      {!hasMetaMask && (
        <p className="landing-page__hint">Installera MetaMask för att logga in.</p>
      )}

      {hasMetaMask && (
        <button
          type="button"
          className="landing-page__login"
          disabled={isConnecting}
          onClick={() => {
            setConnectError('')
            connectMetaMask()
          }}
        >
          {isConnecting ? 'Öppnar MetaMask…' : 'Logga in med MetaMask'}
        </button>
      )}

      {connectError && <p className="landing-page__error">{connectError}</p>}

      <div className="landing-page__whatisrif">
        <button
          type="button"
          className="landing-page__whatisrif-toggle"
          onClick={() => setRifOpen((v) => !v)}
          aria-expanded={rifOpen}
        >
          Vad är Rif? <span className={`landing-page__arrow ${rifOpen ? 'landing-page__arrow--open' : ''}`}>▼</span>
        </button>
        <div className={`landing-page__whatisrif-content ${rifOpen ? 'landing-page__whatisrif-content--open' : ''}`}>
          <p>Rif är en plattform för dig som låtskrivare att bevisa din kreativa process. Du kan samla dina idéer, skisser och soundbites i projekt över tid.</p>
          <p>Istället för att bara visa slutresultatet hjälper Rif dig att dokumentera vägen bakom din skapelse. Varje soundbite blir som en skärmdump på hur låten lät vid en viss tidpunkt.</p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
