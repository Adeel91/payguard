import { collectChainEvidence, assertValidInput } from "../blockchain/evidence";
import { decodeAction } from "../protocols/decoder";
import { buildPolicyChecks } from "../policy/checks";
import { getDecision, getRiskLevel, scoreChecks } from "../policy/scoring";
import { analyzeProtocol } from "../protocols/registry";
import type {
  PayGuardDecision,
  PayGuardReport,
  PayGuardScanInput,
  PayGuardScanOptions,
  PolicyCheck,
} from "../types";

function createScanId() {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random()}`;
  return `pg_${id}`;
}

function summary(decision: PayGuardDecision) {
  if (decision === "ALLOW") {
    return "PayGuard found no blocking issue in the decoded action or live chain evidence.";
  }

  if (decision === "WARN") {
    return "PayGuard found risk signals that should be reviewed before signing.";
  }

  return "PayGuard found high risk signals and recommends stopping this action.";
}

function nextAction(decision: PayGuardDecision) {
  if (decision === "ALLOW") {
    return "Continue only after confirming the recipient, amount, and business purpose.";
  }

  if (decision === "WARN") {
    return "Pause and review the evidence before signing or paying.";
  }

  return "Do not sign this action until the requester, spender, and contract behavior are verified.";
}

function reasons(checks: PolicyCheck[]) {
  const failed = checks.filter((check) => !check.passed);

  if (!failed.length) {
    return ["No failed policy checks were found."];
  }

  return failed.map((check) => check.evidence);
}

export async function buildReport(
  input: PayGuardScanInput,
  options: PayGuardScanOptions,
): Promise<PayGuardReport> {
  assertValidInput(input);

  const decodedAction = decodeAction(input.transactionData);
  const chainEvidence = await collectChainEvidence(input, decodedAction, options);
  const protocol = analyzeProtocol(decodedAction, chainEvidence);

const policyChecks = [
  ...buildPolicyChecks(decodedAction, chainEvidence),
  ...protocol.checks,
];
  const riskScore = scoreChecks(policyChecks);
  const decision = getDecision(riskScore);

  return {
    scanId: createScanId(),
    decision,
    canContinue: decision === "ALLOW",
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    protocol,
    summary: summary(decision),
    decodedAction,
    chainEvidence,
    policyChecks,
    reasons: reasons(policyChecks),
    nextAction: nextAction(decision),
    checkedAt: new Date().toISOString(),
  };
}