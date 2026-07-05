import { formatTokenAmount } from "../blockchain/evidence";
import type { ChainEvidence, DecodedAction, PolicyCheck } from "../types";
import type { ProtocolAnalysis, ProtocolAnalyzer } from "./base";

function tokenLabel(evidence: ChainEvidence) {
  return evidence.token.symbol ?? evidence.token.name ?? "token";
}

export const erc20Analyzer: ProtocolAnalyzer = {
  id: "erc20",

  canAnalyze(action: DecodedAction) {
    return (
      action.type === "ERC20_APPROVE" ||
      action.type === "ERC20_TRANSFER" ||
      action.type === "ERC20_TRANSFER_FROM"
    );
  },

  analyze(action: DecodedAction, evidence: ChainEvidence): ProtocolAnalysis {
    const checks: PolicyCheck[] = [];
    const notes: string[] = [];

    notes.push(
      `Target appears to expose ERC20 compatible metadata for ${tokenLabel(evidence)}.`,
    );

    if (action.type === "ERC20_APPROVE") {
      checks.push({
        id: "erc20_approval_limited",
        title: "ERC20 approval is limited",
        passed: !action.unlimited,
        severity: "CRITICAL",
        evidence: action.unlimited
          ? "The approval grants unlimited token spending authority."
          : `Approval amount is ${formatTokenAmount(
              action.amountRaw,
              evidence.token.decimals,
              evidence.token.symbol,
            )}.`,
      });

      checks.push({
        id: "erc20_allowance_readable",
        title: "Current allowance is readable",
        passed: evidence.currentAllowanceRaw !== undefined,
        severity: "LOW",
        evidence:
          evidence.currentAllowanceRaw !== undefined
            ? `Current allowance is ${formatTokenAmount(
                evidence.currentAllowanceRaw,
                evidence.token.decimals,
                evidence.token.symbol,
              )}.`
            : "Current allowance could not be read from this token contract.",
      });

      return {
        protocol: "ERC20",
        actionLabel: "ERC20 approval",
        confidence: evidence.token.symbol || evidence.token.name ? 0.95 : 0.7,
        evidence: notes,
        checks,
      };
    }

    if (action.type === "ERC20_TRANSFER") {
      const amount = BigInt(action.amountRaw);
      const balance =
        evidence.tokenBalanceRaw === undefined
          ? undefined
          : BigInt(evidence.tokenBalanceRaw);

      checks.push({
        id: "erc20_balance_covers_transfer",
        title: "Wallet balance covers ERC20 transfer",
        passed: balance !== undefined && balance >= amount,
        severity: "HIGH",
        evidence:
          balance === undefined
            ? "Token balance could not be read from this token contract."
            : `Wallet balance is ${formatTokenAmount(
                balance.toString(),
                evidence.token.decimals,
                evidence.token.symbol,
              )}. Transfer amount is ${formatTokenAmount(
                action.amountRaw,
                evidence.token.decimals,
                evidence.token.symbol,
              )}.`,
      });

      return {
        protocol: "ERC20",
        actionLabel: "ERC20 transfer",
        confidence: evidence.token.symbol || evidence.token.name ? 0.95 : 0.7,
        evidence: notes,
        checks,
      };
    }

    checks.push({
      id: "erc20_transfer_from_review",
      title: "ERC20 transferFrom requires review",
      passed: false,
      severity: "HIGH",
      evidence: "transferFrom can move assets from another wallet when allowance exists.",
    });

    return {
      protocol: "ERC20",
      actionLabel: "ERC20 transferFrom",
      confidence: evidence.token.symbol || evidence.token.name ? 0.95 : 0.7,
      evidence: notes,
      checks,
    };
  },
};
