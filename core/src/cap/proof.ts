import { keccak256, toHex, type Hex } from "viem";

export type DeliveryProofInput = {
  requestId: string;
  capabilityId: string;
  report: unknown;
  output: unknown;
};

export type PayGuardDeliveryProof = {
  type: "keccak256_report_hash";
  verifier: "payguard_core_v1";
  capabilityId: string;
  requestId: string;
  reportHash: Hex;
  outputHash: Hex;
  generatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalize(item)]),
    );
  }

  return value;
}

export function hashJson(value: unknown): Hex {
  return keccak256(toHex(JSON.stringify(canonicalize(value))));
}

export function createDeliveryProof(input: DeliveryProofInput): PayGuardDeliveryProof {
  return {
    type: "keccak256_report_hash",
    verifier: "payguard_core_v1",
    capabilityId: input.capabilityId,
    requestId: input.requestId,
    reportHash: hashJson(input.report),
    outputHash: hashJson(input.output),
    generatedAt: new Date().toISOString(),
  };
}
