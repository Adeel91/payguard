import type { PayGuardDecision, PayGuardRiskLevel, PolicyCheck } from "../types";

const weights: Record<PayGuardRiskLevel, number> = {
  LOW: 5,
  MEDIUM: 20,
  HIGH: 35,
  CRITICAL: 70,
};

export function scoreChecks(checks: PolicyCheck[]) {
  const score = checks.reduce((total, check) => {
    if (check.passed) {
      return total;
    }

    return total + weights[check.severity];
  }, 10);

  return Math.min(score, 100);
}

export function getRiskLevel(score: number): PayGuardRiskLevel {
  if (score >= 85) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

export function getDecision(score: number): PayGuardDecision {
  if (score >= 70) return "BLOCK";
  if (score >= 35) return "WARN";
  return "ALLOW";
}