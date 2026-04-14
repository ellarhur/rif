// Hjälpfunktioner för att läsa och byta aktivt nätverk i MetaMask, med fokus på Ethereum Sepolia.
import { CHAIN_IDS } from '../config/contracts'

export const SEPOLIA_CHAIN_ID = BigInt(CHAIN_IDS.sepolia)
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'

/** Läser aktiv kedja direkt från wallet (samma som MetaMask använder). */
export async function getWalletChainId(eip1193) {
  if (!eip1193?.request) return null
  const hex = await eip1193.request({ method: 'eth_chainId' })
  return BigInt(hex)
}

export function isEthereumSepolia(chainId) {
  if (chainId == null) return false
  const id = typeof chainId === 'bigint' ? chainId : BigInt(chainId)
  return id === SEPOLIA_CHAIN_ID
}

/**
 * Ber användaren byta till Ethereum Sepolia (11155111). Kräver användarklick.
 */
export async function switchToEthereumSepolia(eip1193) {
  if (!eip1193?.request) return { ok: false, message: 'Ingen wallet.' }
  try {
    await eip1193.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    })
    return { ok: true }
  } catch (err) {
    if (err?.code === 4902) {
      try {
        await eip1193.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID_HEX,
              chainName: 'Ethereum Sepolia',
              nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://ethereum-sepolia.publicnode.com'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        })
        return { ok: true }
      } catch (addErr) {
        return { ok: false, message: addErr?.message || 'Kunde inte lägga till Sepolia.' }
      }
    }
    if (err?.code === 4001) {
      return { ok: false, message: 'Du avvisade nätverksbytet.' }
    }
    return { ok: false, message: err?.message || 'Nätverksbyte misslyckades.' }
  }
}
