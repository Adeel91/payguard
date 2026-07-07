import type {
  CrooNegotiation,
  CrooOrder,
  FixApprovalInput,
  PayGuardFixApprovalRequest,
} from "./types";
import { getOrderServiceId, safeJsonParse } from "./input";

class PayGuardFixApprovalInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayGuardFixApprovalInputError";
  }
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isChain(value: unknown): value is "base" | "ethereum" {
  return value === "base" || value === "ethereum";
}

function isEvmAddress(value: unknown): value is string {
  return typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);
}

function isUintString(value: unknown): value is string {
  return typeof value === "string" && /^[0-9]+$/.test(value);
}

function decodeApproveSpender(transactionData?: string) {
  if (!transactionData) return undefined;

  const data = transactionData.toLowerCase();

  if (!data.startsWith("0x095ea7b3") || data.length < 138) {
    return undefined;
  }

  return `0x${data.slice(34, 74)}`;
}

export function isFixApprovalOrder(order: CrooOrder) {
  const fixServiceId = process.env.CROO_FIX_APPROVAL_SERVICE_ID?.trim();
  const orderServiceId = getOrderServiceId(order);

  return Boolean(fixServiceId && orderServiceId === fixServiceId);
}

function readFixFromText(text?: string): FixApprovalInput | undefined {
  if (!text) return undefined;

  const chain = text.match(/chain:\s*(base|ethereum)/i)?.[1]?.toLowerCase();
  const walletAddress = text.match(/walletAddress:\s*(0x[a-fA-F0-9]{40})/i)?.[1];
  const tokenAddress =
    text.match(/tokenAddress:\s*(0x[a-fA-F0-9]{40})/i)?.[1] ??
    text.match(/targetAddress:\s*(0x[a-fA-F0-9]{40})/i)?.[1];
  const currentTransactionData =
    text.match(/currentTransactionData:\s*(0x[0-9a-fA-F]*)/i)?.[1] ??
    text.match(/transactionData:\s*(0x[0-9a-fA-F]*)/i)?.[1];
  const spenderAddress =
    text.match(/spenderAddress:\s*(0x[a-fA-F0-9]{40})/i)?.[1] ??
    text.match(/spender:\s*(0x[a-fA-F0-9]{40})/i)?.[1] ??
    decodeApproveSpender(currentTransactionData);
  const safeAmountRaw =
    text.match(/safeAmountRaw:\s*([0-9]+)/i)?.[1] ??
    text.match(/amountRaw:\s*([0-9]+)/i)?.[1] ??
    text.match(/limitedAmountRaw:\s*([0-9]+)/i)?.[1];
  const purpose = text.match(/purpose:\s*([\s\S]*)/i)?.[1]?.trim();

  if (
    !isChain(chain) ||
    !isEvmAddress(tokenAddress) ||
    !isEvmAddress(spenderAddress) ||
    !isUintString(safeAmountRaw) ||
    !purpose
  ) {
    return undefined;
  }

  return {
    chain,
    walletAddress,
    tokenAddress,
    spenderAddress,
    safeAmountRaw,
    currentTransactionData,
    purpose,
  };
}

function readFixFromObject(
  value?: Record<string, unknown>,
): FixApprovalInput | undefined {
  if (!value) return undefined;

  const source =
    value.fix && typeof value.fix === "object"
      ? (value.fix as Record<string, unknown>)
      : value.action && typeof value.action === "object"
        ? (value.action as Record<string, unknown>)
        : value;

  const text = stringValue(source.text);

  if (text) {
    const jsonFromText = safeJsonParse(text);
    const fromJsonText = readFixFromObject(jsonFromText);

    if (fromJsonText) return fromJsonText;

    const fromPlainText = readFixFromText(text);

    if (fromPlainText) return fromPlainText;
  }

  const chain = stringValue(source.chain)?.toLowerCase();
  const walletAddress = stringValue(source.walletAddress);
  const tokenAddress =
    stringValue(source.tokenAddress) ?? stringValue(source.targetAddress);
  const currentTransactionData =
    stringValue(source.currentTransactionData) ?? stringValue(source.transactionData);
  const spenderAddress =
    stringValue(source.spenderAddress) ??
    stringValue(source.spender) ??
    decodeApproveSpender(currentTransactionData);
  const safeAmountRaw =
    stringValue(source.safeAmountRaw) ??
    stringValue(source.amountRaw) ??
    stringValue(source.limitedAmountRaw);
  const purpose = stringValue(source.purpose);

  if (
    !isChain(chain) ||
    !isEvmAddress(tokenAddress) ||
    !isEvmAddress(spenderAddress) ||
    !isUintString(safeAmountRaw) ||
    !purpose
  ) {
    return undefined;
  }

  return {
    chain,
    walletAddress,
    tokenAddress,
    spenderAddress,
    safeAmountRaw,
    currentTransactionData,
    purpose,
  };
}

function getRequirementsSources(negotiation: CrooNegotiation) {
  const requirementsJson = safeJsonParse(negotiation.requirements);
  const metadataJson = safeJsonParse(negotiation.metadata);

  return {
    requirementsJson,
    metadataJson,
    requirementsText: negotiation.requirements,
    metadataText: negotiation.metadata,
  };
}

export function buildFixApprovalRequest(
  order: CrooOrder,
  negotiation: CrooNegotiation,
): PayGuardFixApprovalRequest {
  const { requirementsJson, metadataJson, requirementsText, metadataText } =
    getRequirementsSources(negotiation);

  const fix =
    readFixFromObject(requirementsJson) ??
    readFixFromObject(metadataJson) ??
    readFixFromText(requirementsText) ??
    readFixFromText(metadataText);

  if (!fix) {
    throw new PayGuardFixApprovalInputError(
      "Invalid Fix Unsafe Approval input. Expected chain, tokenAddress, spenderAddress, safeAmountRaw, and purpose.",
    );
  }

  return {
    requestId: order.orderId,
    buyerAgentId:
      order.requesterAgentId ?? negotiation.requesterAgentId ?? "croo_requester_agent",
    sellerAgentId:
      order.providerAgentId ?? negotiation.providerAgentId ?? "payguard_provider_agent",
    fix,
    cap: {
      orderId: order.orderId,
      escrowId: order.chainOrderId,
      buyerAddress: order.requesterWalletAddress,
      paymentTokenAddress: order.paymentToken,
      paymentAmountRaw: order.price,
      paymentTxHash: order.payTxHash,
    },
  };
}
