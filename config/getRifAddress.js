import { CONTRACTS, CHAIN_IDS } from "./contracts";

export function getRifAddress(chainId) {
  if (chainId === CHAIN_IDS.sepolia) return CONTRACTS.sepolia.rif;
  throw new Error(`Unsupported network: ${chainId}`);
}