import { sendBlitzTokens } from "@/lib/blitzFunding";
import { getBlitzTokenAddress } from "@/lib/env";
import { insertBlitzProject, updateBlitzProject } from "@/lib/supabase";

export type BlitzProjectResponse = {
  id: string;
  txHash: string;
  amountBlitz: number;
  tokenAddress: string;
};

export async function createBlitzProject(params: {
  walletAddress: string;
  github: string;
  description: string;
  workingLink?: string | null;
}): Promise<BlitzProjectResponse> {
  const id = await insertBlitzProject({
    wallet_address: params.walletAddress,
    github: params.github,
    description: params.description,
    working_link: params.workingLink ?? null,
    status: "sent",
  });

  try {
    const { txHash, amount } = await sendBlitzTokens(params.walletAddress);

    await updateBlitzProject(id, {
      status: "sent",
      amount_blitz: amount,
      tx_hash: txHash,
      updated_at: new Date().toISOString(),
    });

    return {
      id,
      txHash,
      amountBlitz: amount,
      tokenAddress: getBlitzTokenAddress(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "BLITZ transfer failed.";
    throw new Error(`${message} Your project was saved — contact support or retry.`);
  }
}
