import { AgentClient, DeliverableType } from "@croo-network/sdk";
import type { Event as CrooSdkEvent } from "@croo-network/sdk/dist/types";
import {
  buildPayGuardRequest,
  getOrderServiceId,
  resolveScanMode,
  safeJsonParse,
} from "./input";
import { callPayGuard } from "./payguard-client";
import { createIncompleteInputReport } from "./reports";
import type { CrooEvent, CrooNegotiation, CrooOrder } from "./types";

export function asCrooEvent(event: CrooSdkEvent) {
  const raw = event as unknown;

  if (raw && typeof raw === "object" && "data" in raw) {
    const data = (raw as { data?: unknown }).data;

    if (typeof data === "string") {
      const parsed = safeJsonParse(data);
      return parsed ?? { data };
    }

    if (data && typeof data === "object") {
      return data as CrooEvent;
    }
  }

  return raw as CrooEvent;
}

function eventValue(event: CrooEvent, key: string) {
  const value = event[key];

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function handleNegotiationCreated(client: AgentClient, event: CrooSdkEvent) {
  const crooEvent = asCrooEvent(event);
  const negotiationId = eventValue(crooEvent, "negotiation_id");

  if (!negotiationId) {
    console.warn("Negotiation event missing negotiation_id", crooEvent);
    return;
  }

  try {
    console.log(`Negotiation received: ${negotiationId}`);

    const result = await client.acceptNegotiation(negotiationId);

    console.log(`Negotiation accepted. Order created: ${result.order.orderId}`);
  } catch (error) {
    console.error("Failed to accept negotiation:", error);
  }
}

export async function handleOrderPaid(client: AgentClient, event: CrooSdkEvent) {
  const crooEvent = asCrooEvent(event);
  const orderId = eventValue(crooEvent, "order_id");

  if (!orderId) {
    console.warn("Order paid event missing order_id", crooEvent);
    return;
  }

  let order: CrooOrder | undefined;
  let negotiation: CrooNegotiation | undefined;

  try {
    console.log(`Paid order received: ${orderId}`);

    order = (await client.getOrder(orderId)) as CrooOrder;

    console.log(`CROO service ID: ${getOrderServiceId(order) ?? "unknown"}`);

    negotiation = (await client.getNegotiation(order.negotiationId)) as CrooNegotiation;

    const payGuardRequest = buildPayGuardRequest(order, negotiation);

    console.log(`PayGuard scan mode: ${payGuardRequest.scanMode}`);

    const payGuardResponse = await callPayGuard(payGuardRequest);

    await client.deliverOrder(orderId, {
      deliverableType: DeliverableType.Text,
      deliverableText: JSON.stringify(payGuardResponse, null, 2),
    });

    console.log(`Delivered PayGuard transaction report for order: ${orderId}`);
  } catch (error) {
    console.error("PayGuard failed; delivering WARN report:", error);

    const warningReport = createIncompleteInputReport(
      orderId,
      error,
      negotiation,
      order ? resolveScanMode(order, negotiation) : "full",
    );

    try {
      await client.deliverOrder(orderId, {
        deliverableType: DeliverableType.Text,
        deliverableText: JSON.stringify(warningReport, null, 2),
      });

      console.log(`Delivered incomplete-input WARN report for order: ${orderId}`);
    } catch (deliverError) {
      console.error("Failed to deliver WARN report:", deliverError);

      try {
        await client.rejectOrder(orderId, "PayGuard failed to deliver the report.");
      } catch (rejectError) {
        console.error("Failed to reject order after delivery failure:", rejectError);
      }
    }
  }
}
