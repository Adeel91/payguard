const PAYGUARD_CAPABILITY = {
  id: "payguard_before_signing_payment_risk_scan",
  name: "PayGuard",
  version: "1.0.0",
  category: "web3_payment_safety",
  description:
    "Paid before signing payment risk scan for autonomous agents. PayGuard reviews calldata, chain evidence, contract intelligence, reputation signals, and returns ALLOW, WARN, or BLOCK.",
  pricing: {
    model: "fixed",
    amount: "0.05",
    currency: "USDC",
    network: "base",
  },
  sla: {
    expectedResponseSeconds: 20,
    maxResponseSeconds: 60,
  },
};

export async function GET() {
  return Response.json({
    service: "PayGuard",
    version: "0.1.0",
    name: "PayGuard Safety Agent",
    description: "Paid before signing payment safety agent for Web3 agent commerce.",
    providerType: "paid_cap_provider",
    capabilities: [
      "scanTransaction",
      "decodeCalldata",
      "simulateCall",
      "readChainEvidence",
      "buildPolicyReport",
      "createCapOrder",
      "deliverProof",
    ],
    cap: {
      provider: "PayGuard",
      status: "ready",
      orderEndpoint: "/api/cap/order",
      capabilityEndpoint: "/api/cap/capability",
      capability: PAYGUARD_CAPABILITY,
    },
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
      deliveryProof: "PayGuardDeliveryProof optional",
    },
  });
}
