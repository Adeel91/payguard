import type { PayGuardScanInput } from "../types";
import type { createChainClient } from "./client";

type ChainClient = ReturnType<typeof createChainClient>;

export async function simulateCall(client: ChainClient, input: PayGuardScanInput) {
  try {
    await client.call({
      account: input.walletAddress,
      to: input.targetAddress,
      data: input.transactionData,
      value: input.valueWei ? BigInt(input.valueWei) : undefined,
    });

    return {
      attempted: true,
      success: true,
    };
  } catch (error) {
    return {
      attempted: true,
      success: false,
      error: error instanceof Error ? error.message : "Simulation failed.",
    };
  }
}