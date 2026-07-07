import {
  createCapOrderResponse,
  createCapOrderWarningResponse,
  type PayGuardChain,
  type PayGuardScanMode,
} from "@payguard/core";
import { normalizeCapOrderBody } from "./input";

function getRpcUrls(): Partial<Record<PayGuardChain, string>> {
  return {
    base: process.env.BASE_RPC_URL,
    ethereum: process.env.ETHEREUM_RPC_URL,
  };
}

function getAiOptions(scanMode: PayGuardScanMode) {
  return {
    provider: "gemini" as const,
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL,
    enabled: scanMode === "full" && process.env.PAYGUARD_AI_ENABLED === "true",
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
    scanModes: ["full", "approval"],
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
      ai: getAiOptions(normalizedBody.scanMode ?? "full"),
    });

    return Response.json(response);
  } catch (error) {
    return Response.json(createCapOrderWarningResponse(normalizedBody, error));
  }
}
