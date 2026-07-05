import { isAddress } from "viem";
import type { PayGuardDecision, PayGuardRiskLevel, PolicyCheck } from "../types";

export type CounterpartyVerificationInput = {
  requestId: string;
  buyerAgentId: string;
  sellerAgentId?: string;
  recipientAddress: string;
  paymentTokenAddress?: string;
  paymentAmountRaw?: string;
  purpose?: string;
};

export type CounterpartyVerificationResponse = {
  service: "PayGuard";
  version: string;
  requestId: string;
  buyerAgentId: string;
  sellerAgentId?: string;
  status: "completed";
  decision: PayGuardDecision;
  canContinue: boolean;
  riskScore: number;
  riskLevel: PayGuardRiskLevel;
  checks: PolicyCheck[];
  summary: string;
  checkedAt: string;
};

function getRiskLevel(score: number): PayGuardRiskLevel {
  if (score >= 85) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

function getDecision(score: number): PayGuardDecision {
  if (score >= 70) return "BLOCK";
  if (score >= 35) return "WARN";
  return "ALLOW";
}

function scoreChecks(checks: PolicyCheck[]) {
  return Math.min(
    checks.reduce((total, check) => {
      if (check.passed) return total;

      if (check.severity === "CRITICAL") return total + 70;
      if (check.severity === "HIGH") return total + 35;
      if (check.severity === "MEDIUM") return total + 20;
      return total + 5;
    }, 10),
    100,
  );
}

export function verifyCounterparty(
  input: CounterpartyVerificationInput,
): CounterpartyVerificationResponse {
  const checks: PolicyCheck[] = [];

  checks.push({
    id: "recipient_address_valid",
    title: "Recipient address is valid",
    passed: isAddress(input.recipientAddress),
    severity: "HIGH",
    evidence: isAddress(input.recipientAddress)
      ? "Recipient is a valid EVM address."
      : "Recipient is not a valid EVM address.",
  });

  if (input.paymentTokenAddress) {
    checks.push({
      id: "payment_token_valid",
      title: "Payment token address is valid",
      passed: isAddress(input.paymentTokenAddress),
      severity: "MEDIUM",
      evidence: isAddress(input.paymentTokenAddress)
        ? "Payment token is a valid EVM address."
        : "Payment token is not a valid EVM address.",
    });
  }

  if (input.paymentAmountRaw) {
    const amount = BigInt(input.paymentAmountRaw);

    checks.push({
      id: "payment_amount_positive",
      title: "Payment amount is positive",
      passed: amount > BigInt(0),
      severity: "HIGH",
      evidence:
        amount > BigInt(0)
          ? "Payment amount is greater than zero."
          : "Payment amount is zero.",
    });
  }

  const riskScore = scoreChecks(checks);
  const decision = getDecision(riskScore);

  return {
    service: "PayGuard",
    version: "0.1.0",
    requestId: input.requestId,
    buyerAgentId: input.buyerAgentId,
    sellerAgentId: input.sellerAgentId,
    status: "completed",
    decision,
    canContinue: decision === "ALLOW",
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    checks,
    summary:
      decision === "ALLOW"
        ? "PayGuard found no blocking issue in the counterparty payment request."
        : decision === "WARN"
          ? "PayGuard found counterparty payment risks that should be reviewed."
          : "PayGuard recommends stopping this counterparty payment.",
    checkedAt: new Date().toISOString(),
  };
}