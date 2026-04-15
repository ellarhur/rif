import { CONTRACTS, CHAIN_IDS } from './contracts'

export function getRifAddress(chainId) {
  const id = typeof chainId === 'bigint' ? Number(chainId) : chainId
  if (id === CHAIN_IDS.sepolia) return CONTRACTS.sepolia.rif
  throw new Error(`Unsupported network: ${id}`)
}
