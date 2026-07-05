import { buildReport } from "../report/builder";
import type {
  PayGuardScanOptions,
  PayGuardServiceRequest,
  PayGuardServiceResponse,
} from "../types";

export async function createServiceResponse(
  request: PayGuardServiceRequest,
  options: PayGuardScanOptions,
): Promise<PayGuardServiceResponse> {
  const report = await buildReport(request.action, options);

  return {
    service: "PayGuard",
    version: "0.1.0",
    requestId: request.requestId,
    buyerAgentId: request.buyerAgentId,
    sellerAgentId: request.sellerAgentId,
    status: "completed",
    canContinue: report.canContinue,
    report,
  };
}
