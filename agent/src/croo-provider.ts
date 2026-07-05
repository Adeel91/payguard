import "dotenv/config";
import { createServer } from "node:http";
import { AgentClient, DeliverableType, EventType } from "@croo-network/sdk";
import type { Event as CrooSdkEvent } from "@croo-network/sdk/dist/types";

const DEFAULT_BASE_WETH = "0x4200000000000000000000000000000000000006";
const DEFAULT_DEMO_WALLET = "0x0000000000000000000000000000000000000001";
const DEFAULT_RISKY_APPROVAL_CALLDATA =
  "0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

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

function asCrooEvent(event: CrooSdkEvent) {
  const raw = event as unknown;

  if (raw && typeof raw === "object" && "data" in raw) {
    const data = (raw as { data?: unknown }).data;

    if (typeof data === "string") {
      try {
        return JSON.parse(data) as CrooEvent;
      } catch {
        return { data };
      }
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

function safeJsonParse(value?: string) {
  if (!value) return undefined;

  try {
    return JSON.parse(value) as Record<string, unknown>;
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

function readActionFromObject(
  value?: Record<string, unknown>,
): PayGuardAction | undefined {
  if (!value) return undefined;

  const source =
    value.action && typeof value.action === "object"
      ? (value.action as Record<string, unknown>)
      : value;

  const chain = source.chain;
  const walletAddress = stringValue(source.walletAddress);
  const targetAddress = stringValue(source.targetAddress);
  const transactionData = stringValue(source.transactionData);
  const valueWei = stringValue(source.valueWei);
  const purpose = stringValue(source.purpose);

  if (!isChain(chain) || !walletAddress || !targetAddress || !transactionData) {
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

function buildFallbackAction(): PayGuardAction {
  return {
    chain: "base",
    walletAddress: DEFAULT_DEMO_WALLET,
    targetAddress: DEFAULT_BASE_WETH,
    transactionData: DEFAULT_RISKY_APPROVAL_CALLDATA,
    valueWei: "0",
    purpose:
      "Fallback PayGuard demo scan. Buyer did not provide valid JSON requirements.",
  };
}

function buildPayGuardRequest(
  order: CrooOrder,
  negotiation: CrooNegotiation,
): PayGuardCapRequest {
  const requirementsJson = safeJsonParse(negotiation.requirements);
  const metadataJson = safeJsonParse(negotiation.metadata);

  const action =
    readActionFromObject(requirementsJson) ??
    readActionFromObject(metadataJson) ??
    buildFallbackAction();

  return {
    requestId: order.orderId,
    buyerAgentId:
      order.requesterAgentId ?? negotiation.requesterAgentId ?? "croo_requester_agent",
    sellerAgentId:
      order.providerAgentId ?? negotiation.providerAgentId ?? "payguard_provider_agent",
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

  try {
    console.log(`Paid order received: ${orderId}`);

    const order = (await client.getOrder(orderId)) as CrooOrder;
    const negotiation = (await client.getNegotiation(
      order.negotiationId,
    )) as CrooNegotiation;

    const payGuardRequest = buildPayGuardRequest(order, negotiation);
    const payGuardResponse = await callPayGuard(payGuardRequest);

    await client.deliverOrder(orderId, {
      deliverableType: DeliverableType.Text,
      deliverableText: JSON.stringify(payGuardResponse, null, 2),
    });

    console.log(`Delivered PayGuard report for order: ${orderId}`);
  } catch (error) {
    console.error("Failed to deliver order:", error);

    try {
      await client.rejectOrder(orderId, "PayGuard failed to deliver the scan.");
    } catch (rejectError) {
      console.error("Failed to reject order after delivery failure:", rejectError);
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
