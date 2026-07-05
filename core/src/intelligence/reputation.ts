import type { Address } from "viem";
import type { ReputationAnalysis } from "../types";

type UnknownRecord = Record<string, unknown>;

const GOPLUS_BASE_URL = "https://api.gopluslabs.io/api/v1";

const ADDRESS_RISK_KEYS = [
  "blackmail_activities",
  "phishing_activities",
  "stealing_attack",
  "fake_kyc",
  "malicious_mining_activities",
  "darkweb_transactions",
  "cybercrime",
  "money_laundering",
  "financial_crime",
  "blacklist_doubt",
  "mixer",
  "sanctioned",
  "gas_abuse",
];

const TOKEN_RISK_KEYS = [
  "is_honeypot",
  "is_blacklisted",
  "is_mintable",
  "owner_change_balance",
  "hidden_owner",
  "selfdestruct",
  "external_call",
  "slippage_modifiable",
  "personal_slippage_modifiable",
  "cannot_sell_all",
  "is_anti_whale",
  "transfer_pausable",
  "is_whitelisted",
];

function asRecord(value: unknown): UnknownRecord | undefined {
  return value && typeof value === "object" ? (value as UnknownRecord) : undefined;
}

function isFlagged(value: unknown): boolean {
  return value === "1" || value === 1 || value === true;
}

function getRiskFlags(record: UnknownRecord | undefined, keys: string[]) {
  if (!record) return [];

  return keys.filter((key) => isFlagged(record[key]));
}

function getHeaders() {
  const headers: Record<string, string> = {
    accept: "application/json",
  };

  if (process.env.GOPLUS_API_KEY) {
    headers.Authorization = process.env.GOPLUS_API_KEY;
  }

  return headers;
}

async function fetchJson(url: string): Promise<UnknownRecord | undefined> {
  const response = await fetch(url, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GoPlus returned ${response.status}.`);
  }

  return (await response.json()) as UnknownRecord;
}

function getTokenResult(data: UnknownRecord | undefined, address: Address) {
  const result = asRecord(data?.result);
  if (!result) return undefined;

  return (
    asRecord(result[address]) ??
    asRecord(result[address.toLowerCase()]) ??
    asRecord(result[address.toUpperCase()])
  );
}

export async function getReputationStatus(
  chainId: number,
  address: Address,
): Promise<ReputationAnalysis> {
  const riskFlags: string[] = [];
  const evidence: string[] = [];

  try {
    const addressUrl = `${GOPLUS_BASE_URL}/address_security/${address}?chain_id=${chainId}`;
    const tokenUrl = `${GOPLUS_BASE_URL}/token_security/${chainId}?contract_addresses=${address}`;

    const [addressData, tokenData] = await Promise.allSettled([
      fetchJson(addressUrl),
      fetchJson(tokenUrl),
    ]);

    if (addressData.status === "fulfilled") {
      const addressResult = asRecord(addressData.value?.result);
      const addressFlags = getRiskFlags(addressResult, ADDRESS_RISK_KEYS);
      riskFlags.push(...addressFlags.map((flag) => `address:${flag}`));

      evidence.push(
        addressFlags.length
          ? `GoPlus address security returned ${addressFlags.length} risk flag(s).`
          : "GoPlus address security returned no address risk flags.",
      );

      const maliciousCreated = Number(
        addressResult?.number_of_malicious_contracts_created ?? 0,
      );

      if (maliciousCreated > 0) {
        riskFlags.push("address:number_of_malicious_contracts_created");
        evidence.push(
          `GoPlus reports ${maliciousCreated} malicious contract(s) created by this address.`,
        );
      }
    } else {
      evidence.push(`GoPlus address security failed: ${addressData.reason}`);
    }

    if (tokenData.status === "fulfilled") {
      const tokenResult = getTokenResult(tokenData.value, address);
      const tokenFlags = getRiskFlags(tokenResult, TOKEN_RISK_KEYS);
      riskFlags.push(...tokenFlags.map((flag) => `token:${flag}`));

      evidence.push(
        tokenFlags.length
          ? `GoPlus token security returned ${tokenFlags.length} risk flag(s).`
          : "GoPlus token security returned no token risk flags.",
      );
    } else {
      evidence.push(`GoPlus token security failed: ${tokenData.reason}`);
    }

    return {
      provider: "goplus",
      checked: true,
      riskFlags: Array.from(new Set(riskFlags)),
      evidence,
    };
  } catch (error) {
    return {
      provider: "goplus",
      checked: false,
      riskFlags: [],
      evidence: ["GoPlus reputation lookup could not be completed."],
      error: error instanceof Error ? error.message : "Unknown GoPlus error.",
    };
  }
}