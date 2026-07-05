import { formatUnits, isAddress, type Address } from "viem";
import { erc20Abi } from "./abi";
import { createChainClient } from "./client";
import { getChainConfig } from "./chains";
import { simulateCall } from "./simulation";
import type {
  ChainEvidence,
  DecodedAction,
  PayGuardScanInput,
  PayGuardScanOptions,
} from "../types";

type ChainClient = ReturnType<typeof createChainClient>;

export function assertValidInput(input: PayGuardScanInput) {
  if (!isAddress(input.walletAddress)) {
    throw new Error("Invalid wallet address.");
  }

  if (!isAddress(input.targetAddress)) {
    throw new Error("Invalid target address.");
  }

  if (!input.transactionData?.startsWith("0x") || input.transactionData.length < 10) {
    throw new Error("Invalid transaction data.");
  }
}

async function readString(
  client: ChainClient,
  address: Address,
  functionName: "name" | "symbol",
) {
  try {
    const value = await client.readContract({
      address,
      abi: erc20Abi,
      functionName,
    });

    return String(value);
  } catch {
    return undefined;
  }
}

async function readDecimals(client: ChainClient, address: Address) {
  try {
    const value = await client.readContract({
      address,
      abi: erc20Abi,
      functionName: "decimals",
    });

    return Number(value);
  } catch {
    return undefined;
  }
}

async function readBalance(client: ChainClient, token: Address, owner: Address) {
  try {
    const value = await client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [owner],
    });

    return value.toString();
  } catch {
    return undefined;
  }
}

async function readAllowance(
  client: ChainClient,
  token: Address,
  owner: Address,
  spender: Address,
) {
  try {
    const value = await client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "allowance",
      args: [owner, spender],
    });

    return value.toString();
  } catch {
    return undefined;
  }
}

export function formatTokenAmount(
  amountRaw?: string,
  decimals?: number,
  symbol?: string,
) {
  if (!amountRaw || decimals === undefined) {
    return amountRaw;
  }

  const amount = formatUnits(BigInt(amountRaw), decimals);
  return symbol ? `${amount} ${symbol}` : amount;
}

export async function collectChainEvidence(
  input: PayGuardScanInput,
  decodedAction: DecodedAction,
  options: PayGuardScanOptions,
): Promise<ChainEvidence> {
  const chain = getChainConfig(input.chain);
  const client = createChainClient(input.chain, options);

  const [bytecode, nativeBalanceWei, simulation] = await Promise.all([
    client.getBytecode({ address: input.targetAddress }),
    client.getBalance({ address: input.walletAddress }).then((value) => value.toString()),
    simulateCall(client, input),
  ]);

  const targetBytecodeSize = bytecode ? bytecode.slice(2).length / 2 : 0;

  const token = {
    name: await readString(client, input.targetAddress, "name"),
    symbol: await readString(client, input.targetAddress, "symbol"),
    decimals: await readDecimals(client, input.targetAddress),
  };

  const tokenBalanceRaw = await readBalance(
    client,
    input.targetAddress,
    input.walletAddress,
  );

  const currentAllowanceRaw =
    decodedAction.type === "ERC20_APPROVE"
      ? await readAllowance(
          client,
          input.targetAddress,
          input.walletAddress,
          decodedAction.spender,
        )
      : undefined;

  return {
    chainId: chain.viemChain.id,
    chainName: chain.name,
    targetHasCode: targetBytecodeSize > 0,
    targetBytecodeSize,
    nativeBalanceWei,
    token,
    tokenBalanceRaw,
    currentAllowanceRaw,
    simulation,
  };
}
