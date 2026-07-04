import { scanPayment } from "@payguard/core";
import type { PayGuardScanInput } from "@payguard/core";

type PayGuardAgentRequest = {
  requestId: string;
  buyerAgentId: string;
  sellerAgentId?: string;
  action: PayGuardScanInput;
};

const request: PayGuardAgentRequest = {
  requestId: "demo_scan_001",
  buyerAgentId: "croo_buyer_agent_demo",
  sellerAgentId: "croo_seller_agent_demo",
  action: {
    chain: "base",
    walletAddress: "0x1111111111111111111111111111111111111111",
    targetAddress: "0x4444444444444444444444444444444444444444",
    transactionData:
      "0x095ea7b30000000000000000000000005555555555555555555555555555555555555555ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    purpose: "Approve token spend before paying another agent",
  },
};

const report = scanPayment(request.action);

const response = {
  service: "PayGuard",
  version: "0.1.0",
  requestId: request.requestId,
  buyerAgentId: request.buyerAgentId,
  sellerAgentId: request.sellerAgentId,
  status: "completed",
  canContinue: report.decision === "ALLOW",
  report,
};

console.log(JSON.stringify(response, null, 2));