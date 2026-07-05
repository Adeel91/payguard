import { keccak256, type Address } from "viem";
import { createChainClient } from "../blockchain/client";
import { getChainConfig } from "../blockchain/chains";
import { detectProxy } from "./proxy";
import { getReputationStatus } from "./reputation";
import { getVerificationStatus } from "./verification";
import type {
  ContractIntelligence,
  PayGuardScanInput,
  PayGuardScanOptions,
  PolicyCheck,
} from "../types";

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

  const [proxy, verification, reputation] = await Promise.all([
    detectProxy(client, input.targetAddress as Address, bytecode),
    getVerificationStatus(chain.viemChain.id, input.targetAddress as Address),
    getReputationStatus(chain.viemChain.id, input.targetAddress as Address),
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
    passed: intelligence.verification.checked && intelligence.verification.verified,
    severity: "MEDIUM",
    evidence: intelligence.verification.evidence.join(" "),
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
    passed: !intelligence.proxy.isProxy || Boolean(intelligence.proxy.implementationAddress),
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