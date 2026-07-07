import { PAYGUARD_CAPABILITY_ID } from "../cap/capability";
import { createDeliveryProof } from "../cap/proof";
import { createServiceResponse } from "./response";
import type {
  PayGuardScanOptions,
  PayGuardServiceRequest,
  PayGuardServiceResponse,
} from "../types";

export type PayGuardCapOrderRequest = PayGuardServiceRequest & {
  cap?: {
    orderId?: string;
    escrowId?: string;
    buyerAddress?: string;
    paymentTokenAddress?: string;
    paymentAmountRaw?: string;
    paymentTxHash?: string;
  };
};

export type PayGuardCapOrderResponse = PayGuardServiceResponse & {
  cap: {
    capabilityId: string;
    orderId: string;
    escrowId?: string;
    status: "DELIVERED" | "DELIVERED_WITH_INPUT_WARNING";
    paid: boolean;
  };
  deliveryProof: ReturnType<typeof createDeliveryProof>;
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

function getWarningRequestId(request: unknown) {
  const object = asObject(request);
  const cap = asObject(object?.cap);

  return (
    readString(object, "requestId") ??
    readString(cap, "orderId") ??
    `pg_warn_${Date.now()}`
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

export async function createCapOrderResponse(
  request: PayGuardCapOrderRequest,
  options: PayGuardScanOptions,
): Promise<PayGuardCapOrderResponse> {
  const serviceResponse = await createServiceResponse(request, options);

  const output = {
    decision: serviceResponse.report.decision,
    canContinue: serviceResponse.report.canContinue,
    riskScore: serviceResponse.report.riskScore,
    riskLevel: serviceResponse.report.riskLevel,
    nextAction: serviceResponse.report.nextAction,
  };

  const deliveryProof = createDeliveryProof({
    requestId: request.requestId,
    capabilityId: PAYGUARD_CAPABILITY_ID,
    report: serviceResponse.report,
    output,
  });

  const orderId = clean(request.cap?.orderId) ?? request.requestId;
  const escrowId = clean(request.cap?.escrowId);
  const paymentTxHash = clean(request.cap?.paymentTxHash);

  return {
    ...serviceResponse,
    deliveryProof,
    cap: {
      capabilityId: PAYGUARD_CAPABILITY_ID,
      orderId,
      escrowId,
      status: "DELIVERED",
      paid: Boolean(paymentTxHash || orderId),
    },
  };
}

export function createCapOrderWarningResponse(
  request: unknown,
  error: unknown,
): PayGuardCapOrderResponse {
  const requestId = getWarningRequestId(request);
  const buyerAgentId = getWarningBuyerAgentId(request);
  const sellerAgentId = getWarningSellerAgentId(request);
  const cap = getWarningCap(request);
  const orderId = cap.orderId ?? requestId;
  const checkedAt = new Date().toISOString();

  const report = {
    scanId: `pg_incomplete_${requestId}`,
    decision: "WARN",
    canContinue: false,
    riskScore: 50,
    riskLevel: "MEDIUM",
    protocol: {
      protocol: "UNKNOWN",
      actionLabel: "Incomplete PayGuard input",
      confidence: 0,
      evidence: [
        "PayGuard could not decode a transaction because required input fields were missing or invalid.",
      ],
      checks: [
        {
          id: "payguard_input_complete",
          title: "PayGuard input is complete",
          passed: false,
          severity: "HIGH",
          evidence:
            "Expected chain, walletAddress, targetAddress, transactionData, and purpose.",
        },
      ],
    },
    contractIntelligence: {
      source: "input_validation",
      address: "unknown",
      chainId: 0,
      chainName: "Unknown",
      hasCode: false,
      bytecodeSize: 0,
      bytecodeHash: "0x",
      nativeBalanceWei: "0",
      proxy: {
        isProxy: false,
        proxyType: "UNKNOWN",
        evidence: ["Proxy analysis was not attempted because input was incomplete."],
      },
      verification: {
        provider: "none",
        checked: false,
        verified: false,
        evidence: ["Contract verification was not checked because input was incomplete."],
      },
      reputation: {
        provider: "none",
        checked: false,
        riskFlags: ["INCOMPLETE_INPUT"],
        evidence: ["Reputation checks were not run because input was incomplete."],
      },
      explorer: {
        provider: "none",
        checked: false,
        evidence: ["Explorer lookup was not run because input was incomplete."],
      },
    },
    summary:
      "PayGuard could not complete a transaction risk scan because the CROO order input was missing required transaction fields or used an invalid format.",
    decodedAction: {
      type: "UNKNOWN_CALL",
      functionName: "unknown",
    },
    chainEvidence: {
      chainId: 0,
      chainName: "Unknown",
      targetHasCode: false,
      targetBytecodeSize: 0,
      nativeBalanceWei: "0",
      simulation: {
        attempted: false,
        success: false,
        error: "Simulation was not attempted because input was incomplete.",
      },
    },
    policyChecks: [
      {
        id: "payguard_input_complete",
        title: "PayGuard input is complete",
        passed: false,
        severity: "HIGH",
        evidence:
          "Expected chain, walletAddress, targetAddress, transactionData, and purpose.",
      },
      {
        id: "transaction_data_valid",
        title: "Transaction data is valid calldata",
        passed: false,
        severity: "HIGH",
        evidence: "transactionData must be calldata starting with 0x.",
      },
    ],
    reasons: [
      "The CROO order input was incomplete or invalid.",
      "PayGuard needs chain, walletAddress, targetAddress, transactionData, and purpose.",
      "Input validation failed before a transaction scan could run.",
    ],
    nextAction:
      "Resubmit with valid transaction details. Use plain text or JSON, but include chain, walletAddress, targetAddress, transactionData, and purpose.",
    checkedAt,
    inputWarning: {
      status: "INCOMPLETE_INPUT",
      expectedPlainText:
        "chain: base\nwalletAddress: 0x...\ntargetAddress: 0x...\ntransactionData: 0x...\npurpose: Check this transaction before signing",
      expectedJson: {
        chain: "base",
        walletAddress: "0x0000000000000000000000000000000000000001",
        targetAddress: "0x4200000000000000000000000000000000000006",
        transactionData:
          "0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        purpose: "Check WETH approval before signing",
      },
    },
  } as unknown as PayGuardServiceResponse["report"];

  const serviceResponse = {
    service: "PayGuard",
    version: "0.1.0",
    requestId,
    buyerAgentId,
    sellerAgentId,
    status: "completed",
    canContinue: false,
    report,
  } as PayGuardServiceResponse;

  const output = {
    decision: report.decision,
    canContinue: report.canContinue,
    riskScore: report.riskScore,
    riskLevel: report.riskLevel,
    nextAction: report.nextAction,
  };

  const deliveryProof = createDeliveryProof({
    requestId,
    capabilityId: PAYGUARD_CAPABILITY_ID,
    report,
    output,
  });

  return {
    ...serviceResponse,
    deliveryProof,
    cap: {
      capabilityId: PAYGUARD_CAPABILITY_ID,
      orderId,
      escrowId: cap.escrowId,
      status: "DELIVERED_WITH_INPUT_WARNING",
      paid: Boolean(cap.paymentTxHash || orderId),
    },
  };
}
