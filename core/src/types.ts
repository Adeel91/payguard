import type { Address, Hex } from "viem";

export type PayGuardDecision = "ALLOW" | "WARN" | "BLOCK";

export type PayGuardRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PayGuardChain = "base" | "ethereum";

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

export type PayGuardReport = {
  scanId: string;
  decision: PayGuardDecision;
  canContinue: boolean;
  riskScore: number;
  riskLevel: PayGuardRiskLevel;
  summary: string;
  decodedAction: DecodedAction;
  chainEvidence: ChainEvidence;
  policyChecks: PolicyCheck[];
  reasons: string[];
  nextAction: string;
  checkedAt: string;
};

export type PayGuardScanOptions = {
  rpcUrls: Partial<Record<PayGuardChain, string>>;
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