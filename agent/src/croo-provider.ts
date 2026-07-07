import "dotenv/config";
import { createServer } from "node:http";
import { AgentClient, EventType } from "@croo-network/sdk";
import type { Event as CrooSdkEvent } from "@croo-network/sdk/dist/types";
import { optionalEnv, requiredEnv } from "./croo/env";
import { asCrooEvent, handleNegotiationCreated, handleOrderPaid } from "./croo/handlers";

function startHealthServer() {
  const port = Number(process.env.PORT ?? 3001);

  createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("PayGuard CROO provider online\n");
  }).listen(port, "0.0.0.0", () => {
    console.log(`Health server listening on port ${port}`);
  });
}

async function main() {
  startHealthServer();

  const apiKey = requiredEnv("CROO_SDK_KEY");
  const apiUrl = optionalEnv("CROO_API_URL", "https://api.croo.network");
  const wsUrl = optionalEnv("CROO_WS_URL", "wss://api.croo.network/ws");

  const client = new AgentClient(
    {
      baseURL: apiUrl,
      wsURL: wsUrl,
    },
    apiKey,
  );

  console.log("Starting PayGuard CROO provider...");
  console.log(`CROO API URL: ${apiUrl}`);
  console.log(`CROO WS URL: ${wsUrl}`);
  console.log(`CROO key: ${apiKey.slice(0, 10)}...${apiKey.slice(-4)}`);

  const stream = await client.connectWebSocket();

  console.log("PayGuard provider connected. Waiting for CROO orders...");

  stream.on(EventType.NegotiationCreated, (event: CrooSdkEvent) => {
    void handleNegotiationCreated(client, event);
  });

  stream.on(EventType.OrderPaid, (event: CrooSdkEvent) => {
    void handleOrderPaid(client, event);
  });

  stream.on(EventType.OrderCreated, (event: CrooSdkEvent) => {
    console.log("Order created:", asCrooEvent(event));
  });

  stream.on(EventType.OrderCompleted, (event: CrooSdkEvent) => {
    console.log("Order completed:", asCrooEvent(event));
  });

  stream.on(EventType.OrderRejected, (event: CrooSdkEvent) => {
    console.log("Order rejected:", asCrooEvent(event));
  });

  stream.on(EventType.OrderExpired, (event: CrooSdkEvent) => {
    console.log("Order expired:", asCrooEvent(event));
  });

  process.on("SIGINT", () => {
    console.log("Stopping PayGuard CROO provider...");
    stream.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
