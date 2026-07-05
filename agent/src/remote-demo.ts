import "dotenv/config";

import { PayGuardClient } from "./client";

async function main() {
  const baseUrl = process.env.PAYGUARD_SERVICE_URL ?? "http://localhost:3000";
  const apiKey = process.env.PAYGUARD_AGENT_API_KEY;

  if (!apiKey) {
    throw new Error("Missing PAYGUARD_AGENT_API_KEY");
  }

  const client = new PayGuardClient(baseUrl, apiKey);

  const manifest = await client.getManifest();
  console.log(JSON.stringify(manifest, null, 2));

  const scan = await client.scanTransaction({
    requestId: `remote_scan_${Date.now()}`,
    buyerAgentId: "croo_buyer_agent",
    sellerAgentId: "croo_seller_agent",
    action: {
      chain: "base",
      walletAddress: "0x0000000000000000000000000000000000000001",
      targetAddress: "0x4200000000000000000000000000000000000006",
      transactionData:
        "0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      purpose: "Remote agent checks WETH approval before payment",
    },
  });

  console.log(JSON.stringify(scan, null, 2));

  const counterparty = await client.verifyCounterparty({
    requestId: `counterparty_${Date.now()}`,
    buyerAgentId: "croo_buyer_agent",
    sellerAgentId: "croo_seller_agent",
    recipientAddress: "0x1111111111111111111111111111111111111111",
    paymentTokenAddress: "0x4200000000000000000000000000000000000006",
    paymentAmountRaw: "1000000000000000000",
    purpose: "Verify recipient before agent payment",
  });

  console.log(JSON.stringify(counterparty, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});