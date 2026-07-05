import { createPublicClient, http } from "viem";
import { getChainConfig } from "./chains";
import type { PayGuardChain, PayGuardScanOptions } from "../types";

export function createChainClient(chain: PayGuardChain, options: PayGuardScanOptions) {
  const config = getChainConfig(chain);
  const rpcUrl = options.rpcUrls[chain];

  if (!rpcUrl) {
    throw new Error(`Missing RPC URL for ${config.name}.`);
  }

  return createPublicClient({
    chain: config.viemChain,
    transport: http(rpcUrl),
  });
}