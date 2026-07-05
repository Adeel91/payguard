import type { ChainEvidence, DecodedAction, PolicyCheck } from "../types";
import type { ProtocolAnalysis, ProtocolAnalyzer } from "./base";

export const erc721Analyzer: ProtocolAnalyzer = {
  id: "erc721",

  canAnalyze(action: DecodedAction) {
    return action.type === "OPERATOR_APPROVAL";
  },

  analyze(action: DecodedAction, evidence: ChainEvidence): ProtocolAnalysis {
    const checks: PolicyCheck[] = [];

    if (action.type !== "OPERATOR_APPROVAL") {
      return {
        protocol: "ERC721",
        actionLabel: "Unsupported ERC721 action",
        confidence: 0,
        evidence: [],
        checks,
      };
    }

    checks.push({
      id: "erc721_operator_not_granted",
      title: "Operator approval is not granted",
      passed: !action.approved,
      severity: "CRITICAL",
      evidence: action.approved
        ? "setApprovalForAll grants an operator authority over all supported assets."
        : "This call revokes operator authority.",
    });

    return {
      protocol: "ERC721 or ERC1155",
      actionLabel: action.approved
        ? "Operator approval grant"
        : "Operator approval revoke",
      confidence: evidence.targetHasCode ? 0.75 : 0.4,
      evidence: [
        evidence.targetHasCode
          ? `Target has deployed code on ${evidence.chainName}.`
          : "Target has no deployed code.",
      ],
      checks,
    };
  },
};
