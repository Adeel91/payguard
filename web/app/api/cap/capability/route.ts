import { PAYGUARD_CAPABILITY } from "@payguard/core";

export async function GET() {
  return Response.json({
    provider: {
      name: "PayGuard",
      type: "paid_security_agent",
      network: "base",
    },
    capability: PAYGUARD_CAPABILITY,
  });
}
