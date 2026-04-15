import React, { useState } from 'react'
import { WalletContext } from './walletContext.js'

export function WalletProvider({ children }) {
  const [account, setAccount] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')

  async function connectMetaMask() {
    setConnectError('')
    setIsConnecting(true)

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
    } catch (error) {
      if (error.code === 4001) {
        setConnectError('Du avvisade anslutningen i MetaMask.')
      } else {
        setConnectError('Något gick fel vid anslutningen.')
      }
    }

    setIsConnecting(false)
  }

  async function disconnect() {
    try {
      await window.ethereum.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      })
    } catch {
      //
    }
    setAccount('')
    setConnectError('')
  }

  return (
    <WalletContext.Provider value={{
      account,
      isConnecting,
      connectError,
      setConnectError,
      connectMetaMask,
      disconnect,
      hasMetaMask: Boolean(window.ethereum?.isMetaMask),
    }}>
      {children}
    </WalletContext.Provider>
  )
}

