import { ethers } from 'ethers'
import rifAbi from '../abi/rifAbi.json'
import { getRifAddress } from '../config/getRifAddress'
import { CHAIN_IDS } from '../config/contracts'
import { getWalletChainId, isEthereumSepolia } from './rifChain'

export async function getRifReadOnlyContract(eip1193) {
  if (!eip1193) return null
  const chainId = await getWalletChainId(eip1193)
  if (chainId == null || !isEthereumSepolia(chainId)) return null
  const provider = new ethers.BrowserProvider(eip1193)
  const address = getRifAddress(Number(CHAIN_IDS.sepolia))
  return new ethers.Contract(address, rifAbi, provider)
}
