import { createServiceResponse } from "@payguard/core";
import { NextResponse } from "next/server";

function getRpcUrls() {
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

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");

  if (!header) {
    return undefined;
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer") {
    return undefined;
  }

  return token;
}

export async function POST(request: Request) {
  try {
    const expectedToken = process.env.PAYGUARD_AGENT_API_KEY;
    const actualToken = getBearerToken(request);

    if (!expectedToken || actualToken !== expectedToken) {
      return NextResponse.json(
        {
          ok: false,
          service: "PayGuard",
          status: "unauthorized",
          canContinue: false,
          error: "Unauthorized agent request",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const response = await createServiceResponse(
      {
        requestId: body.requestId,
        buyerAgentId: body.buyerAgentId,
        sellerAgentId: body.sellerAgentId,
        action: body.action,
      },
      {
        rpcUrls: getRpcUrls(),
        ai: getAiOptions(),
      },
    );

    return NextResponse.json({
      ok: true,
      ...response,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "PayGuard",
        version: "0.1.0",
        status: "failed",
        canContinue: false,
        error: error instanceof Error ? error.message : "Agent scan failed",
      },
      { status: 400 },
    );
  }
}
