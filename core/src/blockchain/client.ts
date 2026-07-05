import { createPublicClient, http, type PublicClient } from "viem";
import { getChainConfig } from "./chains";
import type { PayGuardChain, PayGuardScanOptions } from "../types";

export function createChainClient(
  chain: PayGuardChain,
  options: PayGuardScanOptions,
): PublicClient {
  const config = getChainConfig(chain);
  const fallbackRpcUrl = config.viemChain.rpcUrls.default.http[0];
  const rpcUrl = options.rpcUrls[chain] ?? fallbackRpcUrl;

  return createPublicClient({
    chain: config.viemChain,
    transport: http(rpcUrl),
  }) as PublicClient;
}
