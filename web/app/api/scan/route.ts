import { scanPayment } from "@payguard/core";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const report = scanPayment(body);

    return NextResponse.json({
      ok: true,
      service: "PayGuard",
      version: "0.1.0",
      requestId: body.requestId ?? `payguard_scan_${Date.now()}`,
      status: "completed",
      canContinue: report.decision === "ALLOW",
      report,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        service: "PayGuard",
        version: "0.1.0",
        status: "failed",
        canContinue: false,
        error: "Scan failed",
      },
      { status: 400 },
    );
  }
}
