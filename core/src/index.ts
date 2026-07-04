export type PayGuardDecision = "ALLOW" | "WARN" | "BLOCK";

export type PayGuardScanInput = {
  chain: string;
  walletAddress?: string;
  targetAddress?: string;
  transactionData?: string;
  purpose?: string;
};

export type PayGuardReport = {
  decision: PayGuardDecision;
  riskScore: number;
  summary: string;
  reasons: string[];
  nextAction: string;
  checkedAt: string;
};

function isAddressLike(value?: string): boolean {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

function hasTransactionData(value?: string): boolean {
  return Boolean(value && value.startsWith("0x") && value.length > 10);
}

export function scanPayment(input: PayGuardScanInput): PayGuardReport {
  const reasons: string[] = [];
  let riskScore = 10;

  if (!input.chain) {
    riskScore += 20;
    reasons.push("No chain was selected.");
  }

  if (input.targetAddress && !isAddressLike(input.targetAddress)) {
    riskScore += 25;
    reasons.push("Target address does not look like a valid EVM address.");
  }

  if (input.walletAddress && !isAddressLike(input.walletAddress)) {
    riskScore += 15;
    reasons.push("Wallet address does not look like a valid EVM address.");
  }

  if (hasTransactionData(input.transactionData)) {
    riskScore += 20;
    reasons.push("Raw transaction data was provided and needs decoding before signing.");
  }

  if (!input.targetAddress && !input.transactionData) {
    riskScore += 35;
    reasons.push("No target address or transaction data was provided.");
  }

  if (input.purpose && input.purpose.toLowerCase().includes("approve")) {
    riskScore += 25;
    reasons.push("Approval related action detected. Token approvals can create spending risk.");
  }

  riskScore = Math.min(riskScore, 100);

  const decision: PayGuardDecision =
    riskScore >= 70 ? "BLOCK" : riskScore >= 35 ? "WARN" : "ALLOW";

  const summary =
    decision === "ALLOW"
      ? "This action looks low risk based on the current checks."
      : decision === "WARN"
        ? "This action has warning signs and should be reviewed before payment or signing."
        : "This action looks risky and should not continue without manual review.";

  const nextAction =
    decision === "ALLOW"
      ? "Proceed only after confirming the recipient and amount."
      : decision === "WARN"
        ? "Review the warning reasons before signing or paying."
        : "Stop the payment or signing flow and verify the request manually.";

  return {
    decision,
    riskScore,
    summary,
    reasons: reasons.length ? reasons : ["No major warning signs found in the basic scan."],
    nextAction,
    checkedAt: new Date().toISOString()
  };
}