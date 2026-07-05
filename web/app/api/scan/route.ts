import { buildReport } from "@payguard/core";
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const report = await buildReport(
      {
        chain: body.chain,
        walletAddress: body.walletAddress,
        targetAddress: body.targetAddress,
        transactionData: body.transactionData,
        valueWei: body.valueWei,
        purpose: body.purpose,
      },
      {
        rpcUrls: getRpcUrls(),
        ai: getAiOptions(),
      },
    );

    return NextResponse.json({
      ok: true,
      service: "PayGuard",
      version: "0.1.0",
      requestId: body.requestId ?? `pg_scan_${Date.now()}`,
      status: "completed",
      canContinue: report.canContinue,
      report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "PayGuard",
        version: "0.1.0",
        status: "failed",
        canContinue: false,
        error: error instanceof Error ? error.message : "Scan failed",
      },
      { status: 400 },
    );
  }
}
