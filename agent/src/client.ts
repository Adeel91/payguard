export type PayGuardRemoteScanRequest = {
  requestId: string;
  buyerAgentId: string;
  sellerAgentId?: string;
  action: {
    chain: "base" | "ethereum";
    walletAddress: `0x${string}`;
    targetAddress: `0x${string}`;
    transactionData: `0x${string}`;
    valueWei?: string;
    purpose?: string;
  };
};

export type PayGuardCounterpartyRequest = {
  requestId: string;
  buyerAgentId: string;
  sellerAgentId?: string;
  recipientAddress: string;
  paymentTokenAddress?: string;
  paymentAmountRaw?: string;
  purpose?: string;
};

export class PayGuardClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  async scanTransaction(request: PayGuardRemoteScanRequest) {
    return this.post("/api/agent/scan", request);
  }

  async verifyCounterparty(request: PayGuardCounterpartyRequest) {
    return this.post("/api/agent/verify-counterparty", request);
  }

  async getManifest() {
    const response = await fetch(`${this.baseUrl}/api/agent/manifest`);

    if (!response.ok) {
      throw new Error(`Manifest request failed with ${response.status}`);
    }

    return response.json();
  }

  async createCapOrder<TResponse = unknown>(input: unknown): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}/api/cap/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(input),
    });

    const text = await response.text();

    if (!text) {
      throw new Error(
        `CAP order returned empty response. Status ${response.status}. Check web server logs.`,
      );
    }

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `CAP order returned non JSON response. Status ${response.status}. Body: ${text}`,
      );
    }

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    return data as TResponse;
  }

  private async post(path: string, body: unknown) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data, null, 2));
    }

    return data;
  }
}
