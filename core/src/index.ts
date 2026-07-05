export { paymentAbi, erc20Abi } from "./blockchain/abi";
export { chains, getChainConfig } from "./blockchain/chains";
export { createChainClient } from "./blockchain/client";
export { collectChainEvidence, formatTokenAmount } from "./blockchain/evidence";
export { simulateCall } from "./blockchain/simulation";
export { decodeAction } from "./protocols/decoder";
export { buildPolicyChecks } from "./policy/checks";
export { scoreChecks, getDecision, getRiskLevel } from "./policy/scoring";
export { buildReport } from "./report/builder";
export { createServiceResponse } from "./service/response";
export { verifyCounterparty } from "./service/counterparty";
export { analyzeProtocol } from "./protocols/registry";
export {
  buildContractIntelligenceChecks,
  collectContractIntelligence,
} from "./intelligence/contract";

export { detectProxy } from "./intelligence/proxy";
export { getVerificationStatus } from "./intelligence/verification";
export { getReputationStatus } from "./intelligence/reputation";

export { createAiExplanation } from "./ai/explanation";

export type { AiExplanationOptions } from "./ai/explanation";

export type {
  ContractIntelligence,
  ProxyAnalysis,
  ProxyType,
} from "./types";

export type {
  CounterpartyVerificationInput,
  CounterpartyVerificationResponse,
} from "./service/counterparty";

export type {
  ProtocolAnalyzer,
  ProtocolAnalysis,
} from "./protocols/base";

export type {
  ChainEvidence,
  DecodedAction,
  PayGuardChain,
  PayGuardDecision,
  PayGuardReport,
  PayGuardRiskLevel,
  PayGuardScanInput,
  PayGuardScanOptions,
  PayGuardServiceRequest,
  PayGuardServiceResponse,
  PolicyCheck,
  TokenMetadata,
} from "./types";