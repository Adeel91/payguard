import type { Address, Hex } from "viem";
import type { ProtocolAnalysis } from "./protocols/base";

export type PayGuardDecision = "ALLOW" | "WARN" | "BLOCK";

export type PayGuardRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PayGuardChain = "base" | "ethereum";

export type ProxyType = "NONE" | "EIP1967" | "BEACON" | "EIP1167_MINIMAL" | "UNKNOWN";

export type PayGuardScanInput = {
  chain: PayGuardChain;
  walletAddress: Address;
  targetAddress: Address;
  transactionData: Hex;
  valueWei?: string;
  purpose?: string;
};

export type DecodedAction =
  | {
      type: "ERC20_APPROVE";
      functionName: "approve";
      spender: Address;
      amountRaw: string;
      unlimited: boolean;
    }
  | {
      type: "ERC20_TRANSFER";
      functionName: "transfer";
      recipient: Address;
      amountRaw: string;
    }
  | {
      type: "ERC20_TRANSFER_FROM";
      functionName: "transferFrom";
      from: Address;
      recipient: Address;
      amountRaw: string;
    }
  | {
      type: "OPERATOR_APPROVAL";
      functionName: "setApprovalForAll";
      operator: Address;
      approved: boolean;
    }
  | {
      type: "UNKNOWN_CALL";
      selector: string;
    };

export type TokenMetadata = {
  name?: string;
  symbol?: string;
  decimals?: number;
};

export type ChainEvidence = {
  chainId: number;
  chainName: string;
  targetHasCode: boolean;
  targetBytecodeSize: number;
  nativeBalanceWei: string;
  token: TokenMetadata;
  tokenBalanceRaw?: string;
  currentAllowanceRaw?: string;
  simulation: {
    attempted: boolean;
    success: boolean;
    error?: string;
  };
};

export type PolicyCheck = {
  id: string;
  title: string;
  passed: boolean;
  severity: PayGuardRiskLevel;
  evidence: string;
};

export type ProxyAnalysis = {
  isProxy: boolean;
  proxyType: ProxyType;
  implementationAddress?: Address;
  adminAddress?: Address;
  beaconAddress?: Address;
  evidence: string[];
};

export type VerificationAnalysis = {
  provider: "sourcify";
  checked: boolean;
  verified: boolean;
  contractName?: string;
  matchType?: string;
  sourceId?: string;
  evidence: string[];
  error?: string;
};

export type ReputationAnalysis = {
  provider: "goplus";
  checked: boolean;
  riskFlags: string[];
  evidence: string[];
  error?: string;
};

export type ExplorerAnalysis = {
  provider: "blockscout";
  checked: boolean;
  explorerUrl?: string;
  creatorAddress?: Address;
  creationTransactionHash?: string;
  creationBlockNumber?: number;
  createdAt?: string;
  contractName?: string;
  isContract?: boolean;
  isVerified?: boolean;
  evidence: string[];
  error?: string;
};

export type ContractIntelligence = {
  source: "rpc";
  address: Address;
  chainId: number;
  chainName: string;
  hasCode: boolean;
  bytecodeSize: number;
  bytecodeHash?: string;
  nativeBalanceWei: string;
  proxy: ProxyAnalysis;
  verification: VerificationAnalysis;
  reputation: ReputationAnalysis;
  explorer: ExplorerAnalysis;
};

export type PayGuardAiExplanation = {
  provider: "gemini" | "deterministic";
  title: string;
  plainEnglishSummary: string;
  userRiskExplanation: string;
  agentInstruction: string;
  saferAlternative: string;
};

export type PayGuardReport = {
  scanId: string;
  decision: PayGuardDecision;
  canContinue: boolean;
  riskScore: number;
  riskLevel: PayGuardRiskLevel;
  protocol: ProtocolAnalysis;
  summary: string;
  decodedAction: DecodedAction;
  chainEvidence: ChainEvidence;
  policyChecks: PolicyCheck[];
  contractIntelligence: ContractIntelligence;
  aiExplanation?: PayGuardAiExplanation;
  reasons: string[];
  nextAction: string;
  checkedAt: string;
};

export type PayGuardScanOptions = {
  rpcUrls: Partial<Record<PayGuardChain, string>>;
  ai?: {
    provider: "gemini";
    apiKey?: string;
    model?: string;
    enabled?: boolean;
  };
};

export type PayGuardServiceRequest = {
  requestId: string;
  buyerAgentId: string;
  sellerAgentId?: string;
  action: PayGuardScanInput;
};

export type PayGuardServiceResponse = {
  service: "PayGuard";
  version: string;
  requestId: string;
  buyerAgentId: string;
  sellerAgentId?: string;
  status: "completed";
  canContinue: boolean;
  report: PayGuardReport;
};
