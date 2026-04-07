import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import '../styles/LogIn.scss'
import { labelForProvider, useWallet } from '../context/WalletContext.jsx'

const LandingPage = () => {
  const navigate = useNavigate()
  const {
    account,
    availableProviders,
    hasInjectedWallet,
    isConnecting,
    connectError,
    setConnectError,
    connectWithProvider,
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

      {!hasInjectedWallet && (
        <p className="landing-page__hint">Installera t.ex. MetaMask för att logga in med en wallet.</p>
      )}

      {hasInjectedWallet && availableProviders.length === 1 && (
        <button
          type="button"
          className="landing-page__login"
          disabled={isConnecting}
          onClick={() => {
            setConnectError('')
            void connectWithProvider(availableProviders[0])
          }}
        >
          {isConnecting ? 'Öppnar wallet…' : 'Logga in med wallet'}
        </button>
      )}

      {hasInjectedWallet && availableProviders.length > 1 && (
        <div className="landing-page__wallet-picker">
          {availableProviders.map((provider, index) => (
            <button
              key={`${labelForProvider(provider, index)}-${index}`}
              type="button"
              disabled={isConnecting}
              onClick={() => {
                setConnectError('')
                void connectWithProvider(provider)
              }}
            >
              {isConnecting ? 'Ansluter…' : `Logga in med ${labelForProvider(provider, index)}`}
            </button>
          ))}
        </div>
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
          <p>Rif är en plattform för att bevisa din kreativa process. Som artist kan du samla dina idéer, skisser och soundbites i projekt över tid.</p>
          <p>Istället för att bara visa slutresultatet hjälper Rif dig att dokumentera vägen bakom din skapelse.</p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
