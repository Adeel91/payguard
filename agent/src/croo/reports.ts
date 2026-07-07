import type { CrooNegotiation, PayGuardScanMode } from "./types";

const DEFAULT_BASE_WETH = "0x4200000000000000000000000000000000000006";
const DEFAULT_DEMO_WALLET = "0x0000000000000000000000000000000000000001";
const DEFAULT_RISKY_APPROVAL_CALLDATA =
  "0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

export function createIncompleteInputReport(
  orderId: string,
  error: unknown,
  negotiation?: CrooNegotiation,
  scanMode: PayGuardScanMode = "full",
) {
  return {
    service: "PayGuard",
    version: "0.1.0",
    requestId: orderId,
    status: "completed",
    canContinue: false,
    report: {
      decision: "WARN",
      canContinue: false,
      riskScore: 50,
      riskLevel: "MEDIUM",
      status: "INCOMPLETE_INPUT",
      summary:
        "PayGuard could not complete a transaction risk scan because the CROO order input was missing required transaction fields or used an invalid format.",
      reason:
        "Expected chain, walletAddress, targetAddress, transactionData, and purpose. transactionData must be calldata starting with 0x.",
      nextAction:
        "Resubmit with valid transaction details. Plain text and JSON are both supported.",
      expectedPlainText: `chain: base
walletAddress: ${DEFAULT_DEMO_WALLET}
targetAddress: ${DEFAULT_BASE_WETH}
transactionData: ${DEFAULT_RISKY_APPROVAL_CALLDATA}
purpose: Check WETH approval before signing`,
      expectedJson: {
        chain: "base",
        walletAddress: DEFAULT_DEMO_WALLET,
        targetAddress: DEFAULT_BASE_WETH,
        transactionData: DEFAULT_RISKY_APPROVAL_CALLDATA,
        purpose: "Check WETH approval before signing",
      },
      received: {
        requirements: negotiation?.requirements ?? null,
        metadata: negotiation?.metadata ?? null,
      },
      error: error instanceof Error ? error.message : String(error),
      checkedAt: new Date().toISOString(),
    },
    cap: {
      orderId,
      status: "DELIVERED_WITH_INPUT_WARNING",
      paid: true,
      scanMode,
    },
  };
}
