import "dotenv/config";
import { createServer } from "node:http";
import { AgentClient, DeliverableType, EventType } from "@croo-network/sdk";
import type { Event as CrooSdkEvent } from "@croo-network/sdk/dist/types";

const DEFAULT_BASE_WETH = "0x4200000000000000000000000000000000000006";
const DEFAULT_DEMO_WALLET = "0x0000000000000000000000000000000000000001";
const DEFAULT_RISKY_APPROVAL_CALLDATA =
  "0x095ea7b30000000000000000000001111111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

type PayGuardScanMode = "full" | "approval";

type CrooEvent = Record<string, unknown>;

type CrooOrder = {
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

type CrooNegotiation = {
  negotiationId: string;
  requesterAgentId?: string;
  providerAgentId?: string;
  requirements?: string;
  metadata?: string;
};

type PayGuardAction = {
  chain: "base" | "ethereum";
  walletAddress: string;
  targetAddress: string;
  transactionData: string;
  valueWei?: string;
  purpose?: string;
};

type PayGuardCapRequest = {
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

class PayGuardInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayGuardInputError";
  }
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name} in agent/.env`);
  }

  return value;
}

function optionalEnv(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback;
}

function safeJsonParse(value?: string) {
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

function asCrooEvent(event: CrooSdkEvent) {
  const raw = event as unknown;

  if (raw && typeof raw === "object" && "data" in raw) {
    const data = (raw as { data?: unknown }).data;

    if (typeof data === "string") {
      const parsed = safeJsonParse(data);
      return parsed ?? { data };
    }

    if (data && typeof data === "object") {
      return data as CrooEvent;
    }
  }

  return raw as CrooEvent;
}

function eventValue(event: CrooEvent, key: string) {
  const value = event[key];

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
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

function getOrderServiceId(order: CrooOrder) {
  return order.serviceId ?? order.service_id;
}

function resolveScanMode(order: CrooOrder): PayGuardScanMode {
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

function buildPayGuardRequest(
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
    scanMode: resolveScanMode(order),
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

function createIncompleteInputReport(
  orderId: string,
  error: unknown,
  negotiation?: CrooNegotiation,
  scanMode: PayGuardScanMode = "full",
) {
  return {
    service: "PayGuard",
    version: "0.1.0",
    requestId: orderId,
    status: "completed",
    canContinue: false,
    report: {
      decision: "WARN",
      canContinue: false,
      riskScore: 50,
      riskLevel: "MEDIUM",
      status: "INCOMPLETE_INPUT",
      summary:
        "PayGuard could not complete a transaction risk scan because the CROO order input was missing required transaction fields or used an invalid format.",
      reason:
        "Expected chain, walletAddress, targetAddress, transactionData, and purpose. transactionData must be calldata starting with 0x.",
      nextAction:
        "Resubmit with valid transaction details. Plain text and JSON are both supported.",
      expectedPlainText: `chain: base
walletAddress: ${DEFAULT_DEMO_WALLET}
targetAddress: ${DEFAULT_BASE_WETH}
transactionData: ${DEFAULT_RISKY_APPROVAL_CALLDATA}
purpose: Check WETH approval before signing`,
      expectedJson: {
        chain: "base",
        walletAddress: DEFAULT_DEMO_WALLET,
        targetAddress: DEFAULT_BASE_WETH,
        transactionData: DEFAULT_RISKY_APPROVAL_CALLDATA,
        purpose: "Check WETH approval before signing",
      },
      received: {
        requirements: negotiation?.requirements ?? null,
        metadata: negotiation?.metadata ?? null,
      },
      error: error instanceof Error ? error.message : String(error),
      checkedAt: new Date().toISOString(),
    },
    cap: {
      orderId,
      status: "DELIVERED_WITH_INPUT_WARNING",
      paid: true,
      scanMode,
    },
  };
}

async function callPayGuard(request: PayGuardCapRequest) {
  const serviceUrl = requiredEnv("PAYGUARD_SERVICE_URL");
  const apiKey = requiredEnv("PAYGUARD_AGENT_API_KEY");

  const response = await fetch(`${serviceUrl}/api/cap/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  const text = await response.text();

  if (!text) {
    throw new Error(`PayGuard returned empty response. Status ${response.status}`);
  }

  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `PayGuard returned non JSON response. Status ${response.status}. Body: ${text}`,
    );
  }

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

async function handleNegotiationCreated(client: AgentClient, event: CrooEvent) {
  const negotiationId = eventValue(event, "negotiation_id");

  if (!negotiationId) {
    console.warn("Negotiation event missing negotiation_id", event);
    return;
  }

  try {
    console.log(`Negotiation received: ${negotiationId}`);

    const result = await client.acceptNegotiation(negotiationId);

    console.log(`Negotiation accepted. Order created: ${result.order.orderId}`);
  } catch (error) {
    console.error("Failed to accept negotiation:", error);
  }
}

async function handleOrderPaid(client: AgentClient, event: CrooEvent) {
  const orderId = eventValue(event, "order_id");

  if (!orderId) {
    console.warn("Order paid event missing order_id", event);
    return;
  }

  let order: CrooOrder | undefined;
  let negotiation: CrooNegotiation | undefined;

  try {
    console.log(`Paid order received: ${orderId}`);

    order = (await client.getOrder(orderId)) as CrooOrder;

    console.log(`CROO service ID: ${getOrderServiceId(order) ?? "unknown"}`);

    negotiation = (await client.getNegotiation(order.negotiationId)) as CrooNegotiation;

    const payGuardRequest = buildPayGuardRequest(order, negotiation);

    console.log(`PayGuard scan mode: ${payGuardRequest.scanMode}`);

    const payGuardResponse = await callPayGuard(payGuardRequest);

    await client.deliverOrder(orderId, {
      deliverableType: DeliverableType.Text,
      deliverableText: JSON.stringify(payGuardResponse, null, 2),
    });

    console.log(`Delivered PayGuard transaction report for order: ${orderId}`);
  } catch (error) {
    console.error("PayGuard failed; delivering WARN report:", error);

    const warningReport = createIncompleteInputReport(
      orderId,
      error,
      negotiation,
      order ? resolveScanMode(order) : "full",
    );

    try {
      await client.deliverOrder(orderId, {
        deliverableType: DeliverableType.Text,
        deliverableText: JSON.stringify(warningReport, null, 2),
      });

      console.log(`Delivered incomplete-input WARN report for order: ${orderId}`);
    } catch (deliverError) {
      console.error("Failed to deliver WARN report:", deliverError);

      try {
        await client.rejectOrder(orderId, "PayGuard failed to deliver the report.");
      } catch (rejectError) {
        console.error("Failed to reject order after delivery failure:", rejectError);
      }
    }
  }
}

function startHealthServer() {
  const port = Number(process.env.PORT ?? 3001);

  createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("PayGuard CROO provider online\n");
  }).listen(port, "0.0.0.0", () => {
    console.log(`Health server listening on port ${port}`);
  });
}

async function main() {
  startHealthServer();

  const apiKey = requiredEnv("CROO_SDK_KEY");
  const apiUrl = optionalEnv("CROO_API_URL", "https://api.croo.network");
  const wsUrl = optionalEnv("CROO_WS_URL", "wss://api.croo.network/ws");

  const client = new AgentClient(
    {
      baseURL: apiUrl,
      wsURL: wsUrl,
    },
    apiKey,
  );

  console.log("Starting PayGuard CROO provider...");
  console.log(`CROO API URL: ${apiUrl}`);
  console.log(`CROO WS URL: ${wsUrl}`);
  console.log(`CROO key: ${apiKey.slice(0, 10)}...${apiKey.slice(-4)}`);

  const stream = await client.connectWebSocket();

  console.log("PayGuard provider connected. Waiting for CROO orders...");

  stream.on(EventType.NegotiationCreated, (event: CrooSdkEvent) => {
    void handleNegotiationCreated(client, asCrooEvent(event));
  });

  stream.on(EventType.OrderPaid, (event: CrooSdkEvent) => {
    void handleOrderPaid(client, asCrooEvent(event));
  });

  stream.on(EventType.OrderCreated, (event: CrooSdkEvent) => {
    console.log("Order created:", asCrooEvent(event));
  });

  stream.on(EventType.OrderCompleted, (event: CrooSdkEvent) => {
    console.log("Order completed:", asCrooEvent(event));
  });

  stream.on(EventType.OrderRejected, (event: CrooSdkEvent) => {
    console.log("Order rejected:", asCrooEvent(event));
  });

  stream.on(EventType.OrderExpired, (event: CrooSdkEvent) => {
    console.log("Order expired:", asCrooEvent(event));
  });

  process.on("SIGINT", () => {
    console.log("Stopping PayGuard CROO provider...");
    stream.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
