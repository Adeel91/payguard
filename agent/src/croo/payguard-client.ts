import { requiredEnv } from "./env";
import type { PayGuardCapRequest } from "./types";

export async function callPayGuard(request: PayGuardCapRequest) {
  const serviceUrl = requiredEnv("PAYGUARD_SERVICE_URL");
  const apiKey = requiredEnv("PAYGUARD_AGENT_API_KEY");

  const response = await fetch(`${serviceUrl}/api/cap/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  const text = await response.text();

  if (!text) {
    throw new Error(`PayGuard returned empty response. Status ${response.status}`);
  }

  let data: unknown;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `PayGuard returned non JSON response. Status ${response.status}. Body: ${text}`,
    );
  }

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}
