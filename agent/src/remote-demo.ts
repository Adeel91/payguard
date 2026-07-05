import "dotenv/config";

import { PayGuardClient } from "./client";

const BASE_WETH = "0x4200000000000000000000000000000000000006";
const DEMO_WALLET = "0x0000000000000000000000000000000000000001";

type CapOrderResponse = {
  cap?: {
    capabilityId?: string;
    orderId?: string;
    escrowId?: string;
    status?: string;
    paid?: boolean;
  };
  deliveryProof?: {
    reportHash?: string;
    outputHash?: string;
  };
  report?: {
    decision?: string;
  };
};

function envValue(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

async function main() {
  const baseUrl = process.env.PAYGUARD_SERVICE_URL ?? "http://localhost:3000";
  const apiKey = process.env.PAYGUARD_AGENT_API_KEY;

  if (!apiKey) {
    throw new Error("Missing PAYGUARD_AGENT_API_KEY");
  }

  const client = new PayGuardClient(baseUrl, apiKey);

  console.log("PayGuard remote demo");
  console.log(`Service: ${baseUrl}`);

  const manifest = await client.getManifest();

  console.log("");
  console.log("Manifest:");
  console.log(JSON.stringify(manifest, null, 2));

  const scan = await client.scanTransaction({
    requestId: `remote_scan_${Date.now()}`,
    buyerAgentId: "croo_buyer_agent",
    sellerAgentId: "croo_seller_agent",
    action: {
      chain: "base",
      walletAddress: DEMO_WALLET,
      targetAddress: BASE_WETH,
      transactionData:
        "0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      purpose: "Remote agent checks WETH approval before payment",
    },
  });

  console.log("");
  console.log("Direct agent scan:");
  console.log(JSON.stringify(scan, null, 2));

  const counterparty = await client.verifyCounterparty({
    requestId: `counterparty_${Date.now()}`,
    buyerAgentId: "croo_buyer_agent",
    sellerAgentId: "croo_seller_agent",
    recipientAddress: "0x1111111111111111111111111111111111111111",
    paymentTokenAddress: BASE_WETH,
    paymentAmountRaw: "1000000000000000000",
    purpose: "Verify recipient before agent payment",
  });

  console.log("");
  console.log("Counterparty check:");
  console.log(JSON.stringify(counterparty, null, 2));

  const capOrder = await client.createCapOrder<CapOrderResponse>({
    requestId: `cap_order_${Date.now()}`,
    buyerAgentId: "croo_buyer_agent",
    sellerAgentId: "payguard_provider_agent",
    cap: {
      orderId: envValue("CROO_CAP_ORDER_ID") ?? `local_order_${Date.now()}`,
      escrowId: envValue("CROO_ESCROW_ID"),
      buyerAddress: DEMO_WALLET,
      paymentTokenAddress: BASE_WETH,
      paymentAmountRaw: "50000",
      paymentTxHash: envValue("CROO_PAYMENT_TX_HASH"),
    },
    action: {
      chain: "base",
      walletAddress: DEMO_WALLET,
      targetAddress: BASE_WETH,
      transactionData:
        "0x095ea7b30000000000000000000000001111111111111111111111111111111111111111ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      purpose: "Buyer agent pays PayGuard to check this approval before continuing.",
    },
  });

  console.log("");
  console.log("CAP provider order:");
  console.log(JSON.stringify(capOrder.cap, null, 2));

  console.log("");
  console.log("Delivery proof:");
  console.log(JSON.stringify(capOrder.deliveryProof, null, 2));

  if (!capOrder.deliveryProof?.reportHash) {
    throw new Error("CAP order did not return delivery proof.");
  }

  if (capOrder.report?.decision !== "BLOCK") {
    throw new Error(
      `Expected CAP order decision BLOCK but got ${capOrder.report?.decision}`,
    );
  }

  console.log("");
  console.log("PayGuard remote CAP demo passed.");
}

main().catch((error) => {
  console.error("");
  console.error("PayGuard remote demo failed.");
  console.error(error);
  process.exit(1);
});
