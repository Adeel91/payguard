import { decodeFunctionData, parseAbi } from "viem";
import type { Hex } from "viem";

export type PayGuardDecision = "ALLOW" | "WARN" | "BLOCK";

export type PayGuardScanInput = {
  chain: string;
  walletAddress?: string;
  targetAddress?: string;
  transactionData?: string;
  purpose?: string;
};

export type PayGuardDecodedCall =
  | {
      kind: "none";
    }
  | {
      kind: "erc20Approve";
      functionName: "approve";
      spenderAddress: string;
      amount: string;
      isUnlimitedApproval: boolean;
    }
  | {
      kind: "erc20Transfer";
      functionName: "transfer";
      recipientAddress: string;
      amount: string;
    }
  | {
      kind: "erc20TransferFrom";
      functionName: "transferFrom";
      fromAddress: string;
      recipientAddress: string;
      amount: string;
    }
  | {
      kind: "setApprovalForAll";
      functionName: "setApprovalForAll";
      operatorAddress: string;
      approved: boolean;
    }
  | {
      kind: "unknownContractCall";
      selector?: string;
    };

export type PayGuardReport = {
  decision: PayGuardDecision;
  riskScore: number;
  summary: string;
  reasons: string[];
  nextAction: string;
  checkedAt: string;
  decodedCall: PayGuardDecodedCall;
};

type DecodedFunctionData = {
  functionName: string;
  args?: readonly unknown[];
};

const EVM_PAYMENT_ABI = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function setApprovalForAll(address operator, bool approved)",
]);

const MAX_UINT256 = BigInt(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935",
);

function isAddressLike(value?: string): boolean {
  return Boolean(value && /^0x[0123456789abcdefABCDEF]{40}$/.test(value));
}

function hasTransactionData(value?: string): boolean {
  return Boolean(value && value.startsWith("0x") && value.length > 10);
}

function getSelector(value?: string): string | undefined {
  if (!hasTransactionData(value)) {
    return undefined;
  }

  return value?.slice(0, 10);
}

function toSafeString(value: unknown): string {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function toSafeBoolean(value: unknown): boolean {
  return value === true;
}

function decodePaymentCall(input: PayGuardScanInput): PayGuardDecodedCall {
  if (!hasTransactionData(input.transactionData)) {
    return {
      kind: "none",
    };
  }

  try {
    const decoded = decodeFunctionData({
      abi: EVM_PAYMENT_ABI,
      data: input.transactionData as Hex,
    }) as DecodedFunctionData;

    const args = decoded.args ?? [];

    if (decoded.functionName === "approve") {
      const amount = toSafeString(args[1]);

      return {
        kind: "erc20Approve",
        functionName: "approve",
        spenderAddress: toSafeString(args[0]),
        amount,
        isUnlimitedApproval: amount === MAX_UINT256.toString(),
      };
    }

    if (decoded.functionName === "transfer") {
      return {
        kind: "erc20Transfer",
        functionName: "transfer",
        recipientAddress: toSafeString(args[0]),
        amount: toSafeString(args[1]),
      };
    }

    if (decoded.functionName === "transferFrom") {
      return {
        kind: "erc20TransferFrom",
        functionName: "transferFrom",
        fromAddress: toSafeString(args[0]),
        recipientAddress: toSafeString(args[1]),
        amount: toSafeString(args[2]),
      };
    }

    if (decoded.functionName === "setApprovalForAll") {
      return {
        kind: "setApprovalForAll",
        functionName: "setApprovalForAll",
        operatorAddress: toSafeString(args[0]),
        approved: toSafeBoolean(args[1]),
      };
    }

    return {
      kind: "unknownContractCall",
      selector: getSelector(input.transactionData),
    };
  } catch {
    return {
      kind: "unknownContractCall",
      selector: getSelector(input.transactionData),
    };
  }
}

function getSummary(decision: PayGuardDecision): string {
  if (decision === "ALLOW") {
    return "This action looks low risk based on the current checks.";
  }

  if (decision === "WARN") {
    return "This action has warning signs and should be reviewed before payment or signing.";
  }

  return "This action looks risky and should not continue without manual review.";
}

function getNextAction(decision: PayGuardDecision): string {
  if (decision === "ALLOW") {
    return "Proceed only after confirming the recipient and amount.";
  }

  if (decision === "WARN") {
    return "Review the warning reasons before signing or paying.";
  }

  return "Stop the payment or signing flow and verify the request manually.";
}

export function scanPayment(input: PayGuardScanInput): PayGuardReport {
  const reasons: string[] = [];
  const decodedCall = decodePaymentCall(input);
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

  if (input.transactionData && !hasTransactionData(input.transactionData)) {
    riskScore += 20;
    reasons.push("Transaction data was provided but is too short to decode.");
  }

  if (!input.targetAddress && !input.transactionData) {
    riskScore += 35;
    reasons.push("No target address or transaction data was provided.");
  }

  if (decodedCall.kind === "erc20Transfer") {
    riskScore += 5;
    reasons.push("Decoded ERC20 transfer call.");
  }

  if (decodedCall.kind === "erc20TransferFrom") {
    riskScore += 30;
    reasons.push("Decoded ERC20 transferFrom call. This can move funds from another wallet.");
  }

  if (decodedCall.kind === "erc20Approve") {
    riskScore += 35;
    reasons.push("Decoded ERC20 approve call. Token approvals can create spending risk.");

    if (decodedCall.isUnlimitedApproval) {
      riskScore += 25;
      reasons.push("Unlimited token approval detected.");
    }
  }

  if (decodedCall.kind === "setApprovalForAll") {
    if (decodedCall.approved) {
      riskScore += 65;
      reasons.push("Decoded setApprovalForAll approval. This can allow an operator to move many assets.");
    } else {
      riskScore += 10;
      reasons.push("Decoded setApprovalForAll revoke action.");
    }
  }

  if (decodedCall.kind === "unknownContractCall") {
    riskScore += 40;
    reasons.push("Unknown contract call detected. The function selector was not recognized.");
  }

  if (
    input.purpose &&
    input.purpose.toLowerCase().includes("approve") &&
    decodedCall.kind !== "erc20Approve" &&
    decodedCall.kind !== "setApprovalForAll"
  ) {
    riskScore += 15;
    reasons.push("Approval intent was mentioned but the decoded call did not match a known approval pattern.");
  }

  riskScore = Math.min(riskScore, 100);

  const decision: PayGuardDecision =
    riskScore >= 70 ? "BLOCK" : riskScore >= 35 ? "WARN" : "ALLOW";

  return {
    decision,
    riskScore,
    summary: getSummary(decision),
    reasons: reasons.length ? reasons : ["No major warning signs found in the basic scan."],
    nextAction: getNextAction(decision),
    checkedAt: new Date().toISOString(),
    decodedCall,
  };
}