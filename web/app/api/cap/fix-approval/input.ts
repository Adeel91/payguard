import type { PayGuardFixApprovalRequest, PayGuardChain } from "@payguard/core";

type FixApprovalInput = PayGuardFixApprovalRequest["fix"];

function asObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function safeJsonParse(value?: string) {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value) as unknown;

    return asObject(parsed);
  } catch {
    return undefined;
  }
}

function isChain(value: unknown): value is PayGuardChain {
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

function readFromText(text?: string): FixApprovalInput | undefined {
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

function readFromObject(value?: Record<string, unknown>): FixApprovalInput | undefined {
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
    const fromJsonText = readFromObject(jsonFromText);

    if (fromJsonText) return fromJsonText;

    const fromPlainText = readFromText(text);

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

export function normalizeFixApprovalBody(
  body: unknown,
): PayGuardFixApprovalRequest | undefined {
  const object = asObject(body);

  if (!object) return undefined;

  const fix = readFromObject(object);

  if (!fix) return undefined;

  return {
    requestId: stringValue(object.requestId) ?? `pg_fix_${Date.now()}`,
    buyerAgentId: stringValue(object.buyerAgentId) ?? "croo_requester_agent",
    sellerAgentId: stringValue(object.sellerAgentId) ?? "payguard_provider_agent",
    fix,
    cap: asObject(object.cap),
  } as PayGuardFixApprovalRequest;
}
