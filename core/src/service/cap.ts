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
    status: "DELIVERED";
    paid: boolean;
  };
  deliveryProof: ReturnType<typeof createDeliveryProof>;
};

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
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
      paid: Boolean(paymentTxHash),
    },
  };
}
