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
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
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
    const tokenAmount = parseUnits(String(amount), 18);
    const agentBalance = await agentPublicClient.readContract({
      abi: BLITZ_ABI,
      address: tokenAddress,
      functionName: "balanceOf",
      args: [account.address],
    });

    if (agentBalance < tokenAmount) {
      throw new Error(
        "Agent wallet does not have enough BLITZ. Deploy the token with AGENT_PRIVATE_KEY or transfer BLITZ to the agent wallet.",
      );
    }

    const data = encodeFunctionData({
      abi: BLITZ_ABI,
      functionName: "transfer",
      args: [walletAddress as Address, tokenAmount],
    });
    const request = await walletClient.prepareTransactionRequest({
      account,
      chain: monadTestnet,
      to: tokenAddress,
      data,
    });
    const serializedTransaction = await walletClient.signTransaction(request);
    const expectedTxHash = keccak256(serializedTransaction);
    let txHash: typeof expectedTxHash;

    try {
      txHash = await agentPublicClient.sendRawTransaction({
        serializedTransaction,
      });
    } catch (error) {
      if (isRpcTimeoutError(error)) {
        txHash = expectedTxHash;
      } else {
        throw error;
      }
    }

    const receipt = await agentPublicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 90_000,
    });

    if (receipt.status !== "success") {
      throw new Error(`BLITZ transfer reverted on-chain. Transaction: ${txHash}`);
    }

    return { txHash, amount };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`BLITZ transfer failed: ${message}`);
  }
}
