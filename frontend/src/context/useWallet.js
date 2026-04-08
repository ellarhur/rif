import { useContext } from 'react'
import { WalletContext } from './walletContext.js'

export function useWallet() {
  return useContext(WalletContext)
}
