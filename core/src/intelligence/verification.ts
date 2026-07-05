import type { Address } from "viem";
import type { VerificationAnalysis } from "../types";

type UnknownRecord = Record<string, unknown>;

const SOURCIFY_BASE_URL = "https://sourcify.dev/server";

function asRecord(value: unknown): UnknownRecord | undefined {
  return value && typeof value === "object" ? (value as UnknownRecord) : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function findStringValue(value: unknown, keys: string[]): string | undefined {
  const record = asRecord(value);
  if (!record) return undefined;

  for (const key of keys) {
    const direct = asString(record[key]);
    if (direct) return direct;
  }

  for (const item of Object.values(record)) {
    const nested = findStringValue(item, keys);
    if (nested) return nested;
  }

  return undefined;
}

export async function getVerificationStatus(
  chainId: number,
  address: Address,
): Promise<VerificationAnalysis> {
  const url = `${SOURCIFY_BASE_URL}/v2/contract/${chainId}/${address}?fields=all`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      return {
        provider: "sourcify",
        checked: true,
        verified: false,
        evidence: ["Sourcify did not find verified source for this contract."],
      };
    }

    if (!response.ok) {
      return {
        provider: "sourcify",
        checked: false,
        verified: false,
        evidence: ["Sourcify verification lookup failed."],
        error: `Sourcify returned ${response.status}.`,
      };
    }

    const data = (await response.json()) as UnknownRecord;

    const contractName =
      findStringValue(data, ["name", "contractName"]) ??
      findStringValue(data, ["compilationTarget"]);

    const matchType =
      findStringValue(data, ["match", "matchType", "runtimeMatch", "creationMatch"]) ??
      "verified";

    const sourceId =
      findStringValue(data, ["id", "sourceId", "verifiedContractId"]) ?? undefined;

    return {
      provider: "sourcify",
      checked: true,
      verified: true,
      contractName,
      matchType,
      sourceId,
      evidence: [
        contractName
          ? `Sourcify verified source is available for ${contractName}.`
          : "Sourcify verified source is available for this contract.",
        `Verification match status is ${matchType}.`,
      ],
    };
  } catch (error) {
    return {
      provider: "sourcify",
      checked: false,
      verified: false,
      evidence: ["Sourcify verification lookup could not be completed."],
      error: error instanceof Error ? error.message : "Unknown Sourcify error.",
    };
  }
}
