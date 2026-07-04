import { parseUnits } from "viem";
import { monadTestnet } from "viem/chains";
import type { Address } from "viem";
import { getAgentAccount, getAgentWalletClient } from "@/lib/applicationFunding";
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

export async function sendBlitzTokens(
  walletAddress: string,
): Promise<{ txHash: string; amount: number }> {
  const amount = BLITZ_REWARD_AMOUNT;

  try {
    const txHash = await getAgentWalletClient().writeContract({
      account: getAgentAccount(),
      chain: monadTestnet,
      address: getBlitzTokenAddress() as Address,
      abi: BLITZ_ABI,
      functionName: "transfer",
      args: [walletAddress as Address, parseUnits(String(amount), 18)],
    });

    return { txHash, amount };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`BLITZ transfer failed: ${message}`);
  }
}
