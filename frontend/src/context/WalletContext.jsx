import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const WalletContext = createContext(null)

export function labelForProvider(provider, index) {
  if (provider.isRabby) return 'Rabby'
  if (provider.isCoinbaseWallet) return 'Coinbase Wallet'
  if (provider.isBraveWallet) return 'Brave Wallet'
  if (provider.isMetaMask) return 'MetaMask'
  return `Wallet ${index + 1}`
}

function collectEip1193Providers() {
  const { ethereum } = window
  if (!ethereum) return []
  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
    return [...ethereum.providers]
  }
  return [ethereum]
}

export function WalletProvider({ children }) {
  const [availableProviders, setAvailableProviders] = useState([])
  const [activeProvider, setActiveProvider] = useState(null)
  const [account, setAccount] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')

  useEffect(() => {
    setAvailableProviders(collectEip1193Providers())
  }, [])

  const connectWithProvider = useCallback(async (eip1193, { forcePermissionPrompt = false } = {}) => {
    setConnectError('')
    if (!eip1193) {
      setConnectError('Ingen wallet hittades.')
      return
    }
    setIsConnecting(true)
    try {
      if (forcePermissionPrompt) {
        try {
          await eip1193.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }],
          })
        } catch {
          // Vissa wallets saknar revoke — fortsätt ändå.
        }
      }

      try {
        await eip1193.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        })
      } catch (permErr) {
        if (permErr?.code === 4001) {
          setConnectError('Du avvisade anslutningen i wallet.')
          return
        }
        // -32601 m.m. = metoden finns inte, använd klassisk väg nedan.
      }

      let accounts = await eip1193.request({ method: 'eth_accounts' })
      if (!accounts?.length) {
        accounts = await eip1193.request({ method: 'eth_requestAccounts' })
      }

      const address = accounts?.[0] ?? ''
      if (!address) {
        setConnectError('Ingen adress returnerades från wallet.')
        return
      }
      setActiveProvider(eip1193)
      setAccount(address)
    } catch {
      setConnectError('Wallet-anslutning avbröts eller misslyckades.')
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAccount('')
    setActiveProvider(null)
    setConnectError('')
  }, [])

  const value = useMemo(
    () => ({
      account,
      activeProvider,
      availableProviders,
      isConnecting,
      connectError,
      setConnectError,
      connectWithProvider,
      disconnect,
      hasInjectedWallet: availableProviders.length > 0,
    }),
    [
      account,
      activeProvider,
      availableProviders,
      isConnecting,
      connectError,
      connectWithProvider,
      disconnect,
    ]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    throw new Error('useWallet måste användas inuti WalletProvider')
  }
  return ctx
}
