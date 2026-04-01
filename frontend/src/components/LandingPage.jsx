import React, { useEffect } from 'react'
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

  useEffect(() => {
    if (account) {
      navigate('/dashboard')
    }
  }, [account, navigate])

  const handleLoginSingleWallet = () => {
    setConnectError('')
    const [first] = availableProviders
    if (!first) {
      setConnectError('Ingen wallet hittades.')
      return
    }
    void connectWithProvider(first)
  }

  return (
    <div className="landing-page">
      <h1>Rif</h1>
      <p>Proof of Creative Process</p>

      {!hasInjectedWallet && (
        <p className="landing-page__hint">Installera t.ex. MetaMask för att logga in med en wallet.</p>
      )}

      {hasInjectedWallet && availableProviders.length === 1 && (
        <>
          <button
            type="button"
            className="landing-page__login"
            disabled={isConnecting}
            onClick={handleLoginSingleWallet}
          >
            {isConnecting ? 'Öppnar wallet…' : 'Logga in med wallet'}
          </button>
          <button
            type="button"
            className="landing-page__force"
            disabled={isConnecting}
            onClick={() => {
              setConnectError('')
              const [first] = availableProviders
              void connectWithProvider(first, { forcePermissionPrompt: true })
            }}
          >
            Ser du ingen popup? Koppla från sajten och visa wallet igen
          </button>
        </>
      )}

      {hasInjectedWallet && availableProviders.length > 1 && (
        <div className="landing-page__wallet-picker">
          <p className="landing-page__picker-title">Välj wallet att ansluta</p>
          <div className="landing-page__wallet-buttons">
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
                {isConnecting ? 'Ansluter…' : labelForProvider(provider, index)}
              </button>
            ))}
          </div>
          <p className="landing-page__force-hint">Ser du ingen popup?</p>
          <div className="landing-page__wallet-buttons landing-page__wallet-buttons--force">
            {availableProviders.map((provider, index) => (
              <button
                key={`force-${labelForProvider(provider, index)}-${index}`}
                type="button"
                className="landing-page__force"
                disabled={isConnecting}
                onClick={() => {
                  setConnectError('')
                  void connectWithProvider(provider, { forcePermissionPrompt: true })
                }}
              >
                Tvinga dialog – {labelForProvider(provider, index)}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="landing-page__note">
        Första gången ska Chrome öppna din wallet (titta efter MetaMask-räven uppe till höger om inget
        fönster poppar upp). Om sajten redan har tillstånd kan det gå fort utan synlig ruta — använd
        då knappen för att koppla från och visa dialog igen.
      </p>

      {connectError && <p className="landing-page__error">{connectError}</p>}
    </div>
  )
}

export default LandingPage
