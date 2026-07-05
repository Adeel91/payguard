import { getAddress, parseAbi, type Address, type Hex } from "viem";
import type { ProxyAnalysis } from "../types";
import type { createChainClient } from "../blockchain/client";

type ChainClient = ReturnType<typeof createChainClient>;

const EIP1967_IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

const EIP1967_ADMIN_SLOT =
  "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

const EIP1967_BEACON_SLOT =
  "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";

const beaconAbi = parseAbi(["function implementation() view returns (address)"]);

function addressFromStorage(value?: Hex): Address | undefined {
  if (!value || value === "0x") return undefined;

  const clean = value.slice(2).padStart(64, "0");
  const address = `0x${clean.slice(-40)}` as Address;

  if (address.toLowerCase() === "0x0000000000000000000000000000000000000000") {
    return undefined;
  }

  return getAddress(address);
}

function detectMinimalProxy(bytecode?: Hex): Address | undefined {
  if (!bytecode) return undefined;

  const lower = bytecode.toLowerCase();
  const prefix = "0x363d3d373d3d3d363d73";
  const suffix = "5af43d82803e903d91602b57fd5bf3";

  if (!lower.startsWith(prefix) || !lower.endsWith(suffix)) {
    return undefined;
  }

  const implementation = `0x${lower.slice(prefix.length, prefix.length + 40)}` as Address;

  if (implementation.toLowerCase() === "0x0000000000000000000000000000000000000000") {
    return undefined;
  }

  return getAddress(implementation);
}

async function readStorageAddress(
  client: ChainClient,
  address: Address,
  slot: Hex,
): Promise<Address | undefined> {
  try {
    const value = await client.getStorageAt({
      address,
      slot,
    });

    return addressFromStorage(value);
  } catch {
    return undefined;
  }
}

async function readBeaconImplementation(
  client: ChainClient,
  beaconAddress: Address,
): Promise<Address | undefined> {
  try {
    const implementation = await client.readContract({
      address: beaconAddress,
      abi: beaconAbi,
      functionName: "implementation",
    });

    return implementation;
  } catch {
    return undefined;
  }
}

export async function detectProxy(
  client: ChainClient,
  address: Address,
  bytecode?: Hex,
): Promise<ProxyAnalysis> {
  const minimalProxyImplementation = detectMinimalProxy(bytecode);

  if (minimalProxyImplementation) {
    return {
      isProxy: true,
      proxyType: "EIP1167_MINIMAL",
      implementationAddress: minimalProxyImplementation,
      evidence: [`Minimal proxy points to ${minimalProxyImplementation}.`],
    };
  }

  const [implementationAddress, adminAddress, beaconAddress] = await Promise.all([
    readStorageAddress(client, address, EIP1967_IMPLEMENTATION_SLOT),
    readStorageAddress(client, address, EIP1967_ADMIN_SLOT),
    readStorageAddress(client, address, EIP1967_BEACON_SLOT),
  ]);

  if (implementationAddress) {
    return {
      isProxy: true,
      proxyType: "EIP1967",
      implementationAddress,
      adminAddress,
      evidence: [
        `EIP1967 implementation slot points to ${implementationAddress}.`,
        adminAddress
          ? `EIP1967 admin slot points to ${adminAddress}.`
          : "EIP1967 admin slot is empty.",
      ],
    };
  }

  if (beaconAddress) {
    const beaconImplementation = await readBeaconImplementation(client, beaconAddress);

    return {
      isProxy: true,
      proxyType: "BEACON",
      implementationAddress: beaconImplementation,
      beaconAddress,
      evidence: [
        `EIP1967 beacon slot points to ${beaconAddress}.`,
        beaconImplementation
          ? `Beacon implementation points to ${beaconImplementation}.`
          : "Beacon implementation could not be read.",
      ],
    };
  }

  return {
    isProxy: false,
    proxyType: "NONE",
    evidence: ["No standard proxy pattern was detected through RPC storage checks."],
  };
}
