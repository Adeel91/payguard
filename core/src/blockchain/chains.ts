import { base, mainnet } from "viem/chains";
import type { Chain } from "viem";
import type { PayGuardChain } from "../types";

export type ChainConfig = {
  id: PayGuardChain;
  name: string;
  viemChain: Chain;
};

export const chains: Record<PayGuardChain, ChainConfig> = {
  base: {
    id: "base",
    name: "Base",
    viemChain: base,
  },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    viemChain: mainnet,
  },
};

export function getChainConfig(chain: PayGuardChain) {
  return chains[chain];
}
