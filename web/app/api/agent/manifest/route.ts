import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "PayGuard",
    version: "0.1.0",
    name: "PayGuard Safety Agent",
    description:
      "PayGuard reviews unsigned Web3 payment and contract actions before funds move.",
    capabilities: [
      "scanTransaction",
      "decodeCalldata",
      "simulateCall",
      "readChainEvidence",
      "buildPolicyReport",
    ],
    supportedChains: ["base", "ethereum"],
    inputSchema: {
      requestId: "string",
      buyerAgentId: "string",
      sellerAgentId: "string optional",
      action: {
        chain: "base or ethereum",
        walletAddress: "0x address",
        targetAddress: "0x address",
        transactionData: "0x calldata",
        valueWei: "string optional",
        purpose: "string optional",
      },
    },
    outputSchema: {
      service: "PayGuard",
      version: "string",
      requestId: "string",
      buyerAgentId: "string",
      sellerAgentId: "string optional",
      status: "completed",
      canContinue: "boolean",
      report: "PayGuardReport",
    },
  });
}
