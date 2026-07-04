import { scanPayment } from "@payguard/core";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const report = scanPayment(body);

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Scan failed",
      },
      { status: 400 },
    );
  }
}
