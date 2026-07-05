import { decodeFunctionData, type Hex } from "viem";
import { paymentAbi } from "../blockchain/abi";
import type { DecodedAction } from "../types";

const MAX_UINT256 = BigInt(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935",
);

export function decodeAction(data: Hex): DecodedAction {
  try {
    const decoded = decodeFunctionData({
      abi: paymentAbi,
      data,
    });

    if (decoded.functionName === "approve") {
      const [spender, amount] = decoded.args;

      return {
        type: "ERC20_APPROVE",
        functionName: "approve",
        spender,
        amountRaw: amount.toString(),
        unlimited: amount === MAX_UINT256,
      };
    }

    if (decoded.functionName === "transfer") {
      const [recipient, amount] = decoded.args;

      return {
        type: "ERC20_TRANSFER",
        functionName: "transfer",
        recipient,
        amountRaw: amount.toString(),
      };
    }

    if (decoded.functionName === "transferFrom") {
      const [from, recipient, amount] = decoded.args;

      return {
        type: "ERC20_TRANSFER_FROM",
        functionName: "transferFrom",
        from,
        recipient,
        amountRaw: amount.toString(),
      };
    }

    if (decoded.functionName === "setApprovalForAll") {
      const [operator, approved] = decoded.args;

      return {
        type: "OPERATOR_APPROVAL",
        functionName: "setApprovalForAll",
        operator,
        approved,
      };
    }

    return {
      type: "UNKNOWN_CALL",
      selector: data.slice(0, 10),
    };
  } catch {
    return {
      type: "UNKNOWN_CALL",
      selector: data.slice(0, 10),
    };
  }
}