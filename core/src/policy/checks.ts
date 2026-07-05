import { formatTokenAmount } from "../blockchain/evidence";
import type { ChainEvidence, DecodedAction, PolicyCheck } from "../types";

export function buildPolicyChecks(
  decodedAction: DecodedAction,
  evidence: ChainEvidence,
): PolicyCheck[] {
  const checks: PolicyCheck[] = [];

  checks.push({
    id: "target_contract_exists",
    title: "Target contract exists",
    passed: evidence.targetHasCode,
    severity: "HIGH",
    evidence: evidence.targetHasCode
      ? `Target has ${evidence.targetBytecodeSize} bytes of deployed code on ${evidence.chainName}.`
      : "Target has no deployed contract code on the selected chain.",
  });

  checks.push({
    id: "simulation_succeeds",
    title: "Simulation succeeds",
    passed: evidence.simulation.success,
    severity: "MEDIUM",
    evidence: evidence.simulation.success
      ? "The transaction completed successfully in a read only simulation."
      : evidence.simulation.error ?? "The transaction failed in simulation.",
  });

  if (decodedAction.type === "UNKNOWN_CALL") {
    checks.push({
      id: "function_selector_known",
      title: "Function selector is known",
      passed: false,
      severity: "MEDIUM",
      evidence: `Unknown function selector ${decodedAction.selector}.`,
    });
  }

  if (decodedAction.type === "ERC20_APPROVE") {
    checks.push({
      id: "approval_is_limited",
      title: "Approval amount is limited",
      passed: !decodedAction.unlimited,
      severity: "CRITICAL",
      evidence: decodedAction.unlimited
        ? "This transaction grants unlimited token spending authority."
        : `Approval amount is ${formatTokenAmount(
            decodedAction.amountRaw,
            evidence.token.decimals,
            evidence.token.symbol,
          )}.`,
    });

    checks.push({
      id: "current_allowance_readable",
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
          : "Current allowance could not be read from this contract.",
    });
  }

  if (decodedAction.type === "ERC20_TRANSFER") {
    const amount = BigInt(decodedAction.amountRaw);
    const balance =
      evidence.tokenBalanceRaw === undefined ? undefined : BigInt(evidence.tokenBalanceRaw);

    checks.push({
      id: "balance_covers_transfer",
      title: "Wallet balance covers transfer",
      passed: balance !== undefined && balance >= amount,
      severity: "HIGH",
      evidence:
        balance === undefined
          ? "Token balance could not be read from this contract."
          : `Wallet balance is ${formatTokenAmount(
              balance.toString(),
              evidence.token.decimals,
              evidence.token.symbol,
            )}. Transfer amount is ${formatTokenAmount(
              decodedAction.amountRaw,
              evidence.token.decimals,
              evidence.token.symbol,
            )}.`,
    });
  }

  if (decodedAction.type === "ERC20_TRANSFER_FROM") {
    checks.push({
      id: "transfer_from_review_required",
      title: "transferFrom requires review",
      passed: false,
      severity: "HIGH",
      evidence:
        "transferFrom can move assets from another wallet when allowance exists.",
    });
  }

  if (decodedAction.type === "OPERATOR_APPROVAL") {
    checks.push({
      id: "operator_not_approved",
      title: "Operator approval is not granted",
      passed: !decodedAction.approved,
      severity: "CRITICAL",
      evidence: decodedAction.approved
        ? "setApprovalForAll grants an operator authority over all supported assets."
        : "This call revokes operator authority.",
    });
  }

  return checks;
}