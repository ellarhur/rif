import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

const LandingPage = () => {
  const [account, setAccount] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (account) {
      navigate('/dashboard')
    }
  }, [account, navigate])

  const connectWallet = async () => {
    setError('')

    if (!window.ethereum) {
      setError('MetaMask hittades inte. Installera extensionen och prova igen.')
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts?.[0] ?? '')
    } catch {
      setError('Wallet-anslutning avbröts eller misslyckades.')
    }
  }

  return (
    <div className="landing-page">
      <h1>Rif</h1>
      <h2>Proof of Creative Process</h2>
      <button onClick={connectWallet}>Connect Wallet to log in</button>
      {error && <p>{error}</p>}
    </div>
  )
}

export default LandingPage
