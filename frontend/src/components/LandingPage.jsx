import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from 'wagmi'

import '../App.css'

const LandingPage = () => {
  const [account, setAccount] = useState('')
  const [error, setError] = useState('')
  const { isConnected, isLoading } = useWallet();


  const connectWallet = async () => {
    setError('')
    const navigate = useNavigate()
    useEffect(() => {
        if (!isLoading && isConnected) {
            navigate('/RifDashboard');
        }
    }, [isLoading, isConnected, navigate]);

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
    <div>
      <h1>Rif</h1>
      <h2>Proof of Creative Process</h2>
      <button onClick={connectWallet}>Connect Wallet to log in</button>
      {account && <p>Connected: {account}</p>}
      {error && <p>{error}</p>}
    </div>
  )
}

export default LandingPage
