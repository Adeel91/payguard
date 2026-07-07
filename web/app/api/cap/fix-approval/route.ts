import {
  createFixApprovalResponse,
  createFixApprovalWarningResponse,
} from "@payguard/core";
import { normalizeFixApprovalBody } from "./input";

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
    route: "/api/cap/fix-approval",
    methods: ["POST"],
    serviceMode: "fix_approval",
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(createFixApprovalWarningResponse(undefined));
  }

  const normalizedBody = normalizeFixApprovalBody(body);

  if (!normalizedBody) {
    return Response.json(createFixApprovalWarningResponse(body));
  }

  try {
    return Response.json(createFixApprovalResponse(normalizedBody));
  } catch {
    return Response.json(createFixApprovalWarningResponse(normalizedBody));
  }
}
