import type { ChainEvidence, DecodedAction, PolicyCheck } from "../types";
import type { ProtocolAnalysis, ProtocolAnalyzer } from "./base";

export const unknownAnalyzer: ProtocolAnalyzer = {
  id: "unknown",

  canAnalyze() {
    return true;
  },

  analyze(action: DecodedAction, evidence: ChainEvidence): ProtocolAnalysis {
    const checks: PolicyCheck[] = [];

    checks.push({
      id: "unknown_function_selector",
      title: "Function selector is known",
      passed: action.type !== "UNKNOWN_CALL",
      severity: "MEDIUM",
      evidence:
        action.type === "UNKNOWN_CALL"
          ? `Unknown function selector ${action.selector}.`
          : "Function selector was decoded.",
    });

    return {
      protocol: "Unknown",
      actionLabel: "Unknown contract call",
      confidence: evidence.targetHasCode ? 0.5 : 0.2,
      evidence: [
        evidence.targetHasCode
          ? `Target has ${evidence.targetBytecodeSize} bytes of code on ${evidence.chainName}.`
          : "Target has no deployed code.",
      ],
      checks,
    };
  },
};
