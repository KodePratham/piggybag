import { parseEther } from "viem";
import { monadTestnet } from "viem/chains";
import type { AgentDecision } from "@/lib/agent";
import { getAgentPrivateKey } from "@/lib/env";
import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";

let account: PrivateKeyAccount | null = null;
let walletClient: ReturnType<typeof createWalletClient> | null = null;

export const agentPublicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(process.env.MONAD_RPC_URL),
});

export function getAgentAccount(): PrivateKeyAccount {
  if (!account) {
    account = privateKeyToAccount(getAgentPrivateKey() as Hex);
  }
  return account;
}

export function getAgentAddress(): Address {
  return getAgentAccount().address;
}

export function getAgentWalletClient() {
  if (!walletClient) {
    walletClient = createWalletClient({
      account: getAgentAccount(),
      chain: monadTestnet,
      transport: http(process.env.MONAD_RPC_URL),
    });
  }
  return walletClient;
}

export async function sendFundingIfApproved(
  decision: AgentDecision,
  walletAddress: string,
): Promise<{ txHash: string | null; amountMon: number | null }> {
  if (decision.status !== "approved") {
    return { txHash: null, amountMon: null };
  }

  const amountMon = decision.amount_mon;

  try {
    const txHash = await getAgentWalletClient().sendTransaction({
      account: getAgentAccount(),
      chain: monadTestnet,
      to: walletAddress as Address,
      value: parseEther(String(amountMon)),
    });

    return { txHash, amountMon };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Funding transaction failed: ${message}`);
  }
}
