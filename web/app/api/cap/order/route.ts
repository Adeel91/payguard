import {
  createCapOrderResponse,
  createCapOrderWarningResponse,
  type PayGuardCapOrderRequest,
  type PayGuardChain,
} from "@payguard/core";

type NormalizedAction = {
  chain: "base" | "ethereum";
  walletAddress: string;
  targetAddress: string;
  transactionData: string;
  valueWei?: string;
  purpose?: string;
};

function getRpcUrls(): Partial<Record<PayGuardChain, string>> {
  return {
    base: process.env.BASE_RPC_URL,
    ethereum: process.env.ETHEREUM_RPC_URL,
  };
}

function getAiOptions() {
  return {
    provider: "gemini" as const,
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL,
    enabled: process.env.PAYGUARD_AI_ENABLED === "true",
  };
}

function isAuthorized(request: Request) {
  const expected = process.env.PAYGUARD_AGENT_API_KEY;

  if (!expected) {
    return false;
  }

  const header = request.headers.get("authorization") ?? "";

  return header === `Bearer ${expected}`;
}

function asObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function safeJsonParse(value?: string) {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value) as unknown;

    return asObject(parsed);
  } catch {
    return undefined;
  }
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

function readActionFromText(text?: string): NormalizedAction | undefined {
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
): NormalizedAction | undefined {
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

function normalizeCapOrderBody(body: unknown): PayGuardCapOrderRequest | undefined {
  const object = asObject(body);

  if (!object) return undefined;

  const action = readActionFromObject(object);

  if (!action) return undefined;

  return {
    ...object,
    requestId: stringValue(object.requestId) ?? `pg_local_${Date.now()}`,
    buyerAgentId: stringValue(object.buyerAgentId) ?? "croo_requester_agent",
    sellerAgentId: stringValue(object.sellerAgentId) ?? "payguard_provider_agent",
    action,
    cap: asObject(object.cap),
  } as PayGuardCapOrderRequest;
}

export async function GET() {
  return Response.json({
    ok: true,
    service: "PayGuard",
    route: "/api/cap/order",
    methods: ["POST"],
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    return Response.json(createCapOrderWarningResponse(undefined, error));
  }

  const normalizedBody = normalizeCapOrderBody(body);

  if (!normalizedBody) {
    return Response.json(
      createCapOrderWarningResponse(
        body,
        new Error(
          "Invalid PayGuard input. Expected chain, walletAddress, targetAddress, transactionData, and purpose.",
        ),
      ),
    );
  }

  try {
    const response = await createCapOrderResponse(normalizedBody, {
      rpcUrls: getRpcUrls(),
      ai: getAiOptions(),
    });

    return Response.json(response);
  } catch (error) {
    return Response.json(createCapOrderWarningResponse(normalizedBody, error));
  }
}
