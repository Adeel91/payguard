import "dotenv/config";

import { createServiceResponse } from "@payguard/core";
import type { PayGuardServiceRequest } from "@payguard/core";

function getRpcUrls() {
  return {
    base: process.env.BASE_RPC_URL,
    ethereum: process.env.ETHEREUM_RPC_URL,
  };
}

function readRequest(): PayGuardServiceRequest {
  const raw = process.env.PAYGUARD_REQUEST_JSON;

  if (!raw) {
    throw new Error(
      "Missing PAYGUARD_REQUEST_JSON. Pass a real PayGuard service request as JSON.",
    );
  }

  return JSON.parse(raw) as PayGuardServiceRequest;
}

async function main() {
  const request = readRequest();

  const response = await createServiceResponse(request, {
    rpcUrls: getRpcUrls(),
    ai: {
      provider: "gemini",
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL,
      enabled: process.env.PAYGUARD_AI_ENABLED === "true",
    },
  });

  console.log(JSON.stringify(response, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});