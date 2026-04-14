// Returnerar Rif-kontraktets adress för ett givet nätverks-ID, eller kastar fel om nätverket inte stöds.
import { CONTRACTS, CHAIN_IDS } from './contracts'

export function getRifAddress(chainId) {
  const id = typeof chainId === 'bigint' ? Number(chainId) : chainId
  if (id === CHAIN_IDS.sepolia) return CONTRACTS.sepolia.rif
  throw new Error(`Unsupported network: ${id}`)
}
