import { verifyCounterparty } from "@payguard/core";
import { NextResponse } from "next/server";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header) return undefined;

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer") return undefined;

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

    const result = verifyCounterparty({
      requestId: body.requestId ?? `pg_counterparty_${Date.now()}`,
      buyerAgentId: body.buyerAgentId,
      sellerAgentId: body.sellerAgentId,
      recipientAddress: body.recipientAddress,
      paymentTokenAddress: body.paymentTokenAddress,
      paymentAmountRaw: body.paymentAmountRaw,
      purpose: body.purpose,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "PayGuard",
        version: "0.1.0",
        status: "failed",
        canContinue: false,
        error: error instanceof Error ? error.message : "Counterparty check failed",
      },
      { status: 400 },
    );
  }
}
