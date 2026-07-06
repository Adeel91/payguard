import {
  createCapOrderResponse,
  createCapOrderWarningResponse,
  type PayGuardCapOrderRequest,
  type PayGuardChain,
} from "@payguard/core";

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

  try {
    const response = await createCapOrderResponse(body as PayGuardCapOrderRequest, {
      rpcUrls: getRpcUrls(),
      ai: getAiOptions(),
    });

    return Response.json(response);
  } catch (error) {
    return Response.json(createCapOrderWarningResponse(body, error));
  }
}
