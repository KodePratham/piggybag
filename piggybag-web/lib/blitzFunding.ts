import { encodeFunctionData, keccak256, parseUnits } from "viem";
import { monadTestnet } from "viem/chains";
import type { Address } from "viem";
import {
  agentPublicClient,
  getAgentAccount,
  getAgentWalletClient,
} from "@/lib/applicationFunding";
import { getBlitzTokenAddress } from "@/lib/env";

const BLITZ_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export const BLITZ_REWARD_AMOUNT = 10_000;

function isRpcTimeoutError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return message.includes("timed out") || message.includes("took too long");
}

export async function sendBlitzTokens(
  walletAddress: string,
): Promise<{ txHash: string; amount: number }> {
  const amount = BLITZ_REWARD_AMOUNT;

  try {
    const account = getAgentAccount();
    const walletClient = getAgentWalletClient();
    const tokenAddress = getBlitzTokenAddress() as Address;
    const data = encodeFunctionData({
      abi: BLITZ_ABI,
      functionName: "transfer",
      args: [walletAddress as Address, parseUnits(String(amount), 18)],
    });
    const request = await walletClient.prepareTransactionRequest({
      account,
      chain: monadTestnet,
      to: tokenAddress,
      data,
    });
    const serializedTransaction = await walletClient.signTransaction(request);
    const expectedTxHash = keccak256(serializedTransaction);

    try {
      const txHash = await agentPublicClient.sendRawTransaction({
        serializedTransaction,
      });

      return { txHash, amount };
    } catch (error) {
      if (isRpcTimeoutError(error)) {
        return { txHash: expectedTxHash, amount };
      }

      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`BLITZ transfer failed: ${message}`);
  }
}
