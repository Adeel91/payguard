export type PayGuardScanMode = "full" | "approval";

export type CrooEvent = Record<string, unknown>;

export type CrooOrder = {
  orderId: string;
  negotiationId: string;
  chainOrderId?: string;
  requesterAgentId?: string;
  providerAgentId?: string;
  requesterWalletAddress?: string;
  providerWalletAddress?: string;
  price?: string;
  paymentToken?: string;
  payTxHash?: string;
  serviceId?: string;
  service_id?: string;
};

export type CrooNegotiation = {
  negotiationId: string;
  requesterAgentId?: string;
  providerAgentId?: string;
  requirements?: string;
  metadata?: string;
};

export type PayGuardAction = {
  chain: "base" | "ethereum";
  walletAddress: string;
  targetAddress: string;
  transactionData: string;
  valueWei?: string;
  purpose?: string;
};

export type PayGuardCapRequest = {
  requestId: string;
  buyerAgentId: string;
  sellerAgentId?: string;
  scanMode: PayGuardScanMode;
  action: PayGuardAction;
  cap: {
    orderId: string;
    escrowId?: string;
    buyerAddress?: string;
    paymentTokenAddress?: string;
    paymentAmountRaw?: string;
    paymentTxHash?: string;
  };
};
