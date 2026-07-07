export const PAYGUARD_CAPABILITY_ID = "payguard_before_signing_payment_risk_scan";

export const PAYGUARD_CAPABILITY = {
  id: PAYGUARD_CAPABILITY_ID,
  name: "PayGuard",
  version: "1.0.0",
  category: "web3_payment_safety",
  description:
    "Paid before-signing transaction risk scan for autonomous agents. PayGuard reviews calldata, chain evidence, contract intelligence, reputation signals, and returns ALLOW, WARN, or BLOCK.",
  pricing: {
    model: "fixed",
    amount: "0.10",
    currency: "USDC",
    network: "base",
  },
  sla: {
    expectedResponseSeconds: 20,
    maxResponseSeconds: 60,
  },
  acceptanceSchema: {
    type: "object",
    required: ["requestId", "buyerAgentId", "sellerAgentId", "action"],
    properties: {
      requestId: { type: "string" },
      buyerAgentId: { type: "string" },
      sellerAgentId: { type: "string" },
      action: {
        type: "object",
        required: [
          "chain",
          "walletAddress",
          "targetAddress",
          "transactionData",
          "purpose",
        ],
        properties: {
          chain: { type: "string", enum: ["base", "ethereum"] },
          walletAddress: { type: "string" },
          targetAddress: { type: "string" },
          transactionData: { type: "string" },
          purpose: { type: "string" },
        },
      },
    },
  },
  outputSchema: {
    type: "object",
    required: ["decision", "canContinue", "riskScore", "deliveryProof"],
    properties: {
      decision: { type: "string", enum: ["ALLOW", "WARN", "BLOCK"] },
      canContinue: { type: "boolean" },
      riskScore: { type: "number" },
      riskLevel: { type: "string" },
      deliveryProof: {
        type: "object",
        required: ["type", "reportHash", "outputHash", "generatedAt"],
      },
    },
  },
} as const;
