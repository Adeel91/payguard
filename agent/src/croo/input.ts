import type {
  CrooNegotiation,
  CrooOrder,
  PayGuardAction,
  PayGuardCapRequest,
  PayGuardScanMode,
} from "./types";

export class PayGuardInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayGuardInputError";
  }
}

export function safeJsonParse(value?: string) {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value) as unknown;

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return undefined;
  } catch {
    return undefined;
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

function isHexCalldata(value: unknown): value is string {
  return typeof value === "string" && /^0x[0-9a-fA-F]*$/.test(value);
}

export function getOrderServiceId(order: CrooOrder) {
  return order.serviceId ?? order.service_id;
}

function normalizeScanMode(value?: string): PayGuardScanMode | undefined {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) return undefined;

  if (
    normalized === "approval" ||
    normalized === "token approval" ||
    normalized === "token-approval" ||
    normalized === "token_approval"
  ) {
    return "approval";
  }

  if (normalized === "full" || normalized === "full transaction") {
    return "full";
  }

  return undefined;
}

function readScanModeFromText(text?: string): PayGuardScanMode | undefined {
  if (!text) return undefined;

  const match = text.match(
    /scanMode:\s*(approval|full|token approval|token-approval|token_approval)/i,
  );

  return normalizeScanMode(match?.[1]);
}

function readScanModeFromObject(
  value?: Record<string, unknown>,
): PayGuardScanMode | undefined {
  if (!value) return undefined;

  const source =
    value.action && typeof value.action === "object"
      ? (value.action as Record<string, unknown>)
      : value;

  return (
    normalizeScanMode(stringValue(value.scanMode)) ??
    normalizeScanMode(stringValue(source.scanMode)) ??
    readScanModeFromText(stringValue(source.text))
  );
}

function resolveScanModeFromInput(
  negotiation: CrooNegotiation,
): PayGuardScanMode | undefined {
  const requirementsJson = safeJsonParse(negotiation.requirements);
  const metadataJson = safeJsonParse(negotiation.metadata);

  return (
    readScanModeFromObject(requirementsJson) ??
    readScanModeFromObject(metadataJson) ??
    readScanModeFromText(negotiation.requirements) ??
    readScanModeFromText(negotiation.metadata)
  );
}

export function resolveScanMode(
  order: CrooOrder,
  negotiation?: CrooNegotiation,
): PayGuardScanMode {
  const inputScanMode = negotiation ? resolveScanModeFromInput(negotiation) : undefined;

  if (inputScanMode) {
    return inputScanMode;
  }

  const tokenApprovalServiceId = process.env.CROO_TOKEN_APPROVAL_SERVICE_ID?.trim();
  const orderServiceId = getOrderServiceId(order);

  if (tokenApprovalServiceId && orderServiceId === tokenApprovalServiceId) {
    return "approval";
  }

  return "full";
}

function readActionFromText(text?: string): PayGuardAction | undefined {
  if (!text) return undefined;

  const chainMatch = text.match(/chain:\s*(base|ethereum)/i);
  const walletMatch = text.match(/walletAddress:\s*(0x[a-fA-F0-9]{40})/i);
  const targetMatch = text.match(/targetAddress:\s*(0x[a-fA-F0-9]{40})/i);
  const dataMatch = text.match(/transactionData:\s*(0x[a-fA-F0-9]*)/i);
  const purposeMatch = text.match(/purpose:\s*([\s\S]*)/i);

  const chain = chainMatch?.[1]?.toLowerCase();
  const walletAddress = walletMatch?.[1];
  const targetAddress = targetMatch?.[1];
  const transactionData = dataMatch?.[1];
  const purpose = purposeMatch?.[1]?.trim();

  if (
    !isChain(chain) ||
    !isEvmAddress(walletAddress) ||
    !isEvmAddress(targetAddress) ||
    !isHexCalldata(transactionData)
  ) {
    return undefined;
  }

  return {
    chain,
    walletAddress,
    targetAddress,
    transactionData,
    valueWei: "0",
    purpose,
  };
}

function readActionFromObject(
  value?: Record<string, unknown>,
): PayGuardAction | undefined {
  if (!value) return undefined;

  const source =
    value.action && typeof value.action === "object"
      ? (value.action as Record<string, unknown>)
      : value;

  const text = stringValue(source.text);

  if (text) {
    const jsonFromText = safeJsonParse(text);
    const actionFromJsonText = readActionFromObject(jsonFromText);

    if (actionFromJsonText) {
      return actionFromJsonText;
    }

    const actionFromPlainText = readActionFromText(text);

    if (actionFromPlainText) {
      return actionFromPlainText;
    }
  }

  const chain = stringValue(source.chain)?.toLowerCase();
  const walletAddress = stringValue(source.walletAddress);
  const targetAddress = stringValue(source.targetAddress);
  const transactionData = stringValue(source.transactionData);
  const valueWei = stringValue(source.valueWei);
  const purpose = stringValue(source.purpose);

  if (
    !isChain(chain) ||
    !isEvmAddress(walletAddress) ||
    !isEvmAddress(targetAddress) ||
    !isHexCalldata(transactionData)
  ) {
    return undefined;
  }

  return {
    chain,
    walletAddress,
    targetAddress,
    transactionData,
    valueWei,
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

export function buildPayGuardRequest(
  order: CrooOrder,
  negotiation: CrooNegotiation,
): PayGuardCapRequest {
  const { requirementsJson, metadataJson, requirementsText, metadataText } =
    getRequirementsSources(negotiation);

  const action =
    readActionFromObject(requirementsJson) ??
    readActionFromObject(metadataJson) ??
    readActionFromText(requirementsText) ??
    readActionFromText(metadataText);

  if (!action) {
    throw new PayGuardInputError(
      "Invalid PayGuard input. Expected chain, walletAddress, targetAddress, transactionData, and purpose.",
    );
  }

  return {
    requestId: order.orderId,
    buyerAgentId:
      order.requesterAgentId ?? negotiation.requesterAgentId ?? "croo_requester_agent",
    sellerAgentId:
      order.providerAgentId ?? negotiation.providerAgentId ?? "payguard_provider_agent",
    scanMode: resolveScanMode(order, negotiation),
    action,
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
