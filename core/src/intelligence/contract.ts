import { getAddress, keccak256, type Address } from "viem";
import { createChainClient } from "../blockchain/client";
import { getChainConfig } from "../blockchain/chains";
import { detectProxy } from "./proxy";
import { getReputationStatus } from "./reputation";
import { getVerificationStatus } from "./verification";
import type {
  ContractIntelligence,
  ExplorerAnalysis,
  PayGuardChain,
  PayGuardScanInput,
  PayGuardScanOptions,
  PolicyCheck,
} from "../types";

type UnknownRecord = Record<string, unknown>;

const BLOCKSCOUT_BASE_URLS: Partial<Record<PayGuardChain, string>> = {
  base: "https://base.blockscout.com",
  ethereum: "https://eth.blockscout.com",
};

function asRecord(value: unknown): UnknownRecord | undefined {
  return value && typeof value === "object" ? (value as UnknownRecord) : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function normalizeAddress(value: unknown): Address | undefined {
  const raw =
    asString(value) ??
    asString(asRecord(value)?.hash) ??
    asString(asRecord(value)?.address);

  if (!raw) return undefined;

  try {
    return getAddress(raw);
  } catch {
    return undefined;
  }
}

async function fetchJson(url: string): Promise<UnknownRecord> {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Blockscout returned ${response.status}.`);
  }

  return (await response.json()) as UnknownRecord;
}

async function collectExplorerAnalysis(
  chain: PayGuardChain,
  address: Address,
): Promise<ExplorerAnalysis> {
  const baseUrl = BLOCKSCOUT_BASE_URLS[chain];

  if (!baseUrl) {
    return {
      provider: "blockscout",
      checked: false,
      evidence: [`Blockscout is not configured for ${chain}.`],
    };
  }

  const explorerUrl = `${baseUrl}/address/${address}`;

  try {
    const addressData = await fetchJson(`${baseUrl}/api/v2/addresses/${address}`);

    const creatorAddress =
      normalizeAddress(addressData.creator_address_hash) ??
      normalizeAddress(addressData.creator_address);

    const creationTransactionHash =
      asString(addressData.creation_transaction_hash) ??
      asString(addressData.creation_tx_hash) ??
      asString(addressData.created_contract?.toString());

    const creationBlockNumber =
      asNumber(addressData.creation_block_number) ??
      asNumber(addressData.block_number) ??
      asNumber(addressData.created_contract_block_number);

    const contractName =
      asString(addressData.name) ??
      asString(addressData.contract_name) ??
      asString(addressData.smart_contract?.toString());

    const isContract =
      typeof addressData.is_contract === "boolean" ? addressData.is_contract : undefined;

    const isVerified =
      typeof addressData.is_verified === "boolean"
        ? addressData.is_verified
        : typeof addressData.is_verified_via_sourcify === "boolean"
          ? addressData.is_verified_via_sourcify
          : undefined;

    let createdAt: string | undefined;

    if (creationTransactionHash) {
      try {
        const txData = await fetchJson(
          `${baseUrl}/api/v2/transactions/${creationTransactionHash}`,
        );

        createdAt =
          asString(txData.timestamp) ??
          asString(txData.created_at) ??
          asString(txData.block_timestamp);
      } catch {
        createdAt = undefined;
      }
    }

    const evidence = [
      `Blockscout explorer page is ${explorerUrl}.`,
      creatorAddress
        ? `Contract creator is ${creatorAddress}.`
        : "Contract creator was not returned by Blockscout.",
      creationTransactionHash
        ? `Creation transaction is ${creationTransactionHash}.`
        : "Creation transaction was not returned by Blockscout.",
      createdAt
        ? `Contract creation timestamp is ${createdAt}.`
        : "Contract creation timestamp was not available.",
    ];

    return {
      provider: "blockscout",
      checked: true,
      explorerUrl,
      creatorAddress,
      creationTransactionHash,
      creationBlockNumber,
      createdAt,
      contractName,
      isContract,
      isVerified,
      evidence,
    };
  } catch (error) {
    return {
      provider: "blockscout",
      checked: false,
      explorerUrl,
      evidence: ["Blockscout metadata lookup could not be completed."],
      error: error instanceof Error ? error.message : "Unknown Blockscout error.",
    };
  }
}

export async function collectContractIntelligence(
  input: PayGuardScanInput,
  options: PayGuardScanOptions,
): Promise<ContractIntelligence> {
  const chain = getChainConfig(input.chain);
  const client = createChainClient(input.chain, options);

  const [bytecode, nativeBalanceWei] = await Promise.all([
    client.getBytecode({ address: input.targetAddress }),
    client.getBalance({ address: input.targetAddress }).then((value) => value.toString()),
  ]);

  const bytecodeSize = bytecode ? bytecode.slice(2).length / 2 : 0;
  const hasCode = bytecodeSize > 0;
  const bytecodeHash = bytecode ? keccak256(bytecode) : undefined;

  const [proxy, verification, reputation, explorer] = await Promise.all([
    detectProxy(client, input.targetAddress as Address, bytecode),
    getVerificationStatus(chain.viemChain.id, input.targetAddress as Address),
    getReputationStatus(chain.viemChain.id, input.targetAddress as Address),
    collectExplorerAnalysis(input.chain, input.targetAddress as Address),
  ]);

  return {
    source: "rpc",
    address: input.targetAddress,
    chainId: chain.viemChain.id,
    chainName: chain.name,
    hasCode,
    bytecodeSize,
    bytecodeHash,
    nativeBalanceWei,
    proxy,
    verification,
    reputation,
    explorer,
  };
}

export function buildContractIntelligenceChecks(
  intelligence: ContractIntelligence,
): PolicyCheck[] {
  const checks: PolicyCheck[] = [];

  checks.push({
    id: "contract_code_exists",
    title: "Contract code exists",
    passed: intelligence.hasCode,
    severity: "HIGH",
    evidence: intelligence.hasCode
      ? `Target has ${intelligence.bytecodeSize} bytes of deployed code on ${intelligence.chainName}.`
      : "Target has no deployed contract code on the selected chain.",
  });

  checks.push({
    id: "contract_source_verified",
    title: "Contract source is verified",
    passed:
      (intelligence.verification.checked && intelligence.verification.verified) ||
      Boolean(intelligence.explorer.isVerified),
    severity: "MEDIUM",
    evidence: [
      ...intelligence.verification.evidence,
      intelligence.explorer.isVerified
        ? "Blockscout reports this contract as verified."
        : "Blockscout did not confirm verified source.",
    ].join(" "),
  });

  checks.push({
    id: "contract_reputation_clean",
    title: "Contract reputation has no known risk flags",
    passed:
      intelligence.reputation.checked && intelligence.reputation.riskFlags.length === 0,
    severity: "HIGH",
    evidence: intelligence.reputation.evidence.join(" "),
  });

  checks.push({
    id: "explorer_metadata_available",
    title: "Explorer metadata is available",
    passed: intelligence.explorer.checked,
    severity: "LOW",
    evidence: intelligence.explorer.evidence.join(" "),
  });

  checks.push({
    id: "proxy_review",
    title: "Proxy risk review",
    passed: !intelligence.proxy.isProxy,
    severity: "MEDIUM",
    evidence: intelligence.proxy.isProxy
      ? `Target is a ${intelligence.proxy.proxyType} proxy. ${intelligence.proxy.evidence.join(" ")}`
      : "Target does not match standard proxy patterns.",
  });

  checks.push({
    id: "proxy_implementation_visible",
    title: "Proxy implementation is visible",
    passed:
      !intelligence.proxy.isProxy || Boolean(intelligence.proxy.implementationAddress),
    severity: "HIGH",
    evidence:
      intelligence.proxy.isProxy && intelligence.proxy.implementationAddress
        ? `Implementation address is ${intelligence.proxy.implementationAddress}.`
        : intelligence.proxy.isProxy
          ? "Proxy implementation address could not be resolved."
          : "Target is not a proxy.",
  });

  return checks;
}
