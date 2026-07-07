import { PAYGUARD_CAPABILITY_ID } from "../cap/capability";
import { createDeliveryProof } from "../cap/proof";
import type { PayGuardChain } from "../types";

const APPROVE_SELECTOR = "0x095ea7b3";

export type PayGuardFixApprovalRequest = {
  requestId: string;
  buyerAgentId: string;
  sellerAgentId?: string;
  fix: {
    chain: PayGuardChain;
    walletAddress?: string;
    tokenAddress: string;
    spenderAddress: string;
    safeAmountRaw: string;
    currentTransactionData?: string;
    purpose?: string;
  };
  cap?: {
    orderId?: string;
    escrowId?: string;
    buyerAddress?: string;
    paymentTokenAddress?: string;
    paymentAmountRaw?: string;
    paymentTxHash?: string;
  };
};

export type PayGuardFixApprovalResponse = {
  service: "PayGuard";
  version: string;
  requestId: string;
  buyerAgentId: string;
  sellerAgentId?: string;
  status: "completed";
  canContinue: boolean;
  report: {
    scanType: "FIX_UNSAFE_APPROVAL";
    decision: "FIXED";
    canContinue: true;
    riskReduced: true;
    summary: string;
    whatWasWrong: string;
    whyThisIsDangerous: string;
    whyThisFixIsSafer: string;
    signingInstructions: string[];
    verificationChecklist: string[];
    original?: {
      currentTransactionData?: string;
      decodedSpender?: string;
      decodedAmountRaw?: string;
      unlimited?: boolean;
    };
    replacement: {
      chain: PayGuardChain;
      targetAddress: string;
      transactionData: string;
      functionName: "approve";
      spenderAddress: string;
      safeAmountRaw: string;
    };
    reasons: string[];
    nextAction: string;
    checkedAt: string;
  };
  deliveryProof: ReturnType<typeof createDeliveryProof>;
  cap: {
    capabilityId: string;
    orderId: string;
    escrowId?: string;
    status: "DELIVERED";
    paid: boolean;
    serviceMode: "fix_approval";
  };
};

export type PayGuardFixApprovalWarningResponse = {
  service: "PayGuard";
  version: string;
  requestId: string;
  buyerAgentId: string;
  sellerAgentId?: string;
  status: "completed";
  canContinue: false;
  report: {
    scanType: "FIX_UNSAFE_APPROVAL";
    decision: "WARN";
    status: "INCOMPLETE_FIX_INPUT";
    summary: string;
    reasons: string[];
    expectedPlainText: string;
    expectedJson: Record<string, unknown>;
    checkedAt: string;
  };
  deliveryProof: ReturnType<typeof createDeliveryProof>;
  cap: {
    capabilityId: string;
    orderId: string;
    escrowId?: string;
    status: "DELIVERED_WITH_INPUT_WARNING";
    paid: boolean;
    serviceMode: "fix_approval";
  };
};

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function asObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function readString(source: Record<string, unknown> | undefined, key: string) {
  const value = source?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isEvmAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function isUintString(value: string) {
  return /^[0-9]+$/.test(value);
}

function padAddress(address: string) {
  return address.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

function padUint(value: string) {
  return BigInt(value).toString(16).padStart(64, "0");
}

function encodeApproveCalldata(spenderAddress: string, amountRaw: string) {
  return `${APPROVE_SELECTOR}${padAddress(spenderAddress)}${padUint(amountRaw)}`;
}

function decodeApproveCalldata(data?: string) {
  if (!data) return undefined;

  const normalized = data.toLowerCase();

  if (!normalized.startsWith(APPROVE_SELECTOR) || normalized.length < 138) {
    return undefined;
  }

  const spender = `0x${normalized.slice(34, 74)}`;
  const amountHex = normalized.slice(74, 138);
  const amountRaw = BigInt(`0x${amountHex}`).toString();
  const unlimited =
    amountRaw ===
    "115792089237316195423570985008687907853269984665640564039457584007913129639935";

  return {
    spender,
    amountRaw,
    unlimited,
  };
}

function getWarningRequestId(request: unknown) {
  const object = asObject(request);
  const cap = asObject(object?.cap);

  return (
    readString(object, "requestId") ??
    readString(cap, "orderId") ??
    `pg_fix_warn_${Date.now()}`
  );
}

function getWarningBuyerAgentId(request: unknown) {
  const object = asObject(request);

  return readString(object, "buyerAgentId") ?? "croo_requester_agent";
}

function getWarningSellerAgentId(request: unknown) {
  const object = asObject(request);

  return readString(object, "sellerAgentId") ?? "payguard_provider_agent";
}

function getWarningCap(request: unknown) {
  const object = asObject(request);
  const cap = asObject(object?.cap);

  return {
    orderId: readString(cap, "orderId"),
    escrowId: readString(cap, "escrowId"),
    paymentTxHash: readString(cap, "paymentTxHash"),
  };
}

function validateFixRequest(request: PayGuardFixApprovalRequest) {
  if (!isEvmAddress(request.fix.tokenAddress)) {
    throw new Error("tokenAddress must be a valid EVM address.");
  }

  if (!isEvmAddress(request.fix.spenderAddress)) {
    throw new Error("spenderAddress must be a valid EVM address.");
  }

  if (!isUintString(request.fix.safeAmountRaw)) {
    throw new Error("safeAmountRaw must be a decimal integer string.");
  }

  if (BigInt(request.fix.safeAmountRaw) <= 0n) {
    throw new Error("safeAmountRaw must be greater than 0.");
  }
}

export function createFixApprovalResponse(
  request: PayGuardFixApprovalRequest,
): PayGuardFixApprovalResponse {
  validateFixRequest(request);

  const checkedAt = new Date().toISOString();
  const decodedOriginal = decodeApproveCalldata(request.fix.currentTransactionData);
  const transactionData = encodeApproveCalldata(
    request.fix.spenderAddress,
    request.fix.safeAmountRaw,
  );

  const report: PayGuardFixApprovalResponse["report"] = {
    scanType: "FIX_UNSAFE_APPROVAL",
    decision: "FIXED",
    canContinue: true,
    riskReduced: true,
    summary:
      "PayGuard generated safer replacement approval calldata using a limited approval amount instead of unlimited token spending authority.",
    whatWasWrong:
      "The original approval appears to grant unlimited token spending authority. Unlimited approvals allow the spender to move future token balances without asking for another approval.",
    whyThisIsDangerous:
      "If the spender address is malicious, compromised, or later upgraded into unsafe behavior, the wallet can lose more tokens than intended because the approval is not limited to this task.",
    whyThisFixIsSafer:
      "The replacement calldata keeps the same token contract and spender but replaces the unlimited approval amount with the requested safeAmountRaw. This reduces the spender permission to a specific limited amount.",
    signingInstructions: [
      "Use replacement.targetAddress as the transaction target.",
      "Use replacement.transactionData as the calldata.",
      "Confirm replacement.safeAmountRaw is the exact amount needed for the task.",
      "Do not sign the original unlimited approval calldata.",
    ],
    verificationChecklist: [
      "Token address matches the intended token.",
      "Spender address matches the intended protocol or agent.",
      "safeAmountRaw matches the exact amount needed.",
      "The calldata starts with 0x095ea7b3, the ERC20 approve selector.",
    ],
    original: {
      currentTransactionData: request.fix.currentTransactionData,
      decodedSpender: decodedOriginal?.spender,
      decodedAmountRaw: decodedOriginal?.amountRaw,
      unlimited: decodedOriginal?.unlimited,
    },
    replacement: {
      chain: request.fix.chain,
      targetAddress: request.fix.tokenAddress,
      transactionData,
      functionName: "approve",
      spenderAddress: request.fix.spenderAddress,
      safeAmountRaw: request.fix.safeAmountRaw,
    },
    reasons: [
      "Unlimited token approvals can expose future wallet balances.",
      "The replacement calldata keeps the same spender but limits the approved amount.",
      "Buyer agents should sign the replacement transaction only after confirming the amount matches the intended task.",
    ],
    nextAction:
      "Use the replacement targetAddress and transactionData for signing instead of the unsafe unlimited approval.",
    checkedAt,
  };

  const output = {
    decision: report.decision,
    canContinue: report.canContinue,
    riskReduced: report.riskReduced,
    replacement: report.replacement,
  };

  const deliveryProof = createDeliveryProof({
    requestId: request.requestId,
    capabilityId: PAYGUARD_CAPABILITY_ID,
    report,
    output,
  });

  const orderId = clean(request.cap?.orderId) ?? request.requestId;
  const escrowId = clean(request.cap?.escrowId);
  const paymentTxHash = clean(request.cap?.paymentTxHash);

  return {
    service: "PayGuard",
    version: "0.1.0",
    requestId: request.requestId,
    buyerAgentId: request.buyerAgentId,
    sellerAgentId: request.sellerAgentId,
    status: "completed",
    canContinue: true,
    report,
    deliveryProof,
    cap: {
      capabilityId: PAYGUARD_CAPABILITY_ID,
      orderId,
      escrowId,
      status: "DELIVERED",
      paid: Boolean(paymentTxHash || orderId),
      serviceMode: "fix_approval",
    },
  };
}

export function createFixApprovalWarningResponse(
  request: unknown,
): PayGuardFixApprovalWarningResponse {
  const requestId = getWarningRequestId(request);
  const buyerAgentId = getWarningBuyerAgentId(request);
  const sellerAgentId = getWarningSellerAgentId(request);
  const cap = getWarningCap(request);
  const orderId = cap.orderId ?? requestId;
  const checkedAt = new Date().toISOString();

  const report: PayGuardFixApprovalWarningResponse["report"] = {
    scanType: "FIX_UNSAFE_APPROVAL",
    decision: "WARN",
    status: "INCOMPLETE_FIX_INPUT",
    summary:
      "PayGuard could not generate replacement approval calldata because required fix fields were missing or invalid.",
    reasons: [
      "Fix Unsafe Approval needs chain, tokenAddress, spenderAddress, safeAmountRaw, and purpose.",
      "safeAmountRaw must be a decimal integer amount in raw token units.",
      "tokenAddress and spenderAddress must be valid EVM addresses.",
    ],
    expectedPlainText:
      "chain: base\ntokenAddress: 0x4200000000000000000000000000000000000006\nspenderAddress: 0x1111111111111111111111111111111111111111\nsafeAmountRaw: 100000000000000000\npurpose: Replace unlimited approval with limited approval",
    expectedJson: {
      chain: "base",
      tokenAddress: "0x4200000000000000000000000000000000000006",
      spenderAddress: "0x1111111111111111111111111111111111111111",
      safeAmountRaw: "100000000000000000",
      purpose: "Replace unlimited approval with limited approval",
    },
    checkedAt,
  };

  const output = {
    decision: report.decision,
    canContinue: false,
    status: report.status,
  };

  const deliveryProof = createDeliveryProof({
    requestId,
    capabilityId: PAYGUARD_CAPABILITY_ID,
    report,
    output,
  });

  return {
    service: "PayGuard",
    version: "0.1.0",
    requestId,
    buyerAgentId,
    sellerAgentId,
    status: "completed",
    canContinue: false,
    report,
    deliveryProof,
    cap: {
      capabilityId: PAYGUARD_CAPABILITY_ID,
      orderId,
      escrowId: cap.escrowId,
      status: "DELIVERED_WITH_INPUT_WARNING",
      paid: Boolean(cap.paymentTxHash || orderId),
      serviceMode: "fix_approval",
    },
  };
}
