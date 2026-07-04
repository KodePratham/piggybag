import { generateBlitzCompliment } from "@/lib/agent";
import { sendBlitzTokens } from "@/lib/blitzFunding";
import { getBlitzTokenAddress } from "@/lib/env";
import {
  getBlitzProjectByWallet,
  insertBlitzProject,
  updateBlitzProject,
  type BlitzProjectRow,
} from "@/lib/supabase";

export class BlitzAlreadySubmittedError extends Error {
  constructor() {
    super("This wallet already submitted a Monad Blitz project. One submission per wallet.");
    this.name = "BlitzAlreadySubmittedError";
  }
}

export type BlitzProjectResponse = {
  id: string;
  txHash: string;
  amountBlitz: number;
  tokenAddress: string;
  compliment: string;
  github: string;
  description: string;
  workingLink: string | null;
};

function toBlitzProjectResponse(row: BlitzProjectRow): BlitzProjectResponse {
  return {
    id: row.id,
    txHash: row.tx_hash ?? "",
    amountBlitz: row.amount_blitz ?? 0,
    tokenAddress: getBlitzTokenAddress(),
    compliment: row.compliment ?? "",
    github: row.github,
    description: row.description,
    workingLink: row.working_link,
  };
}

export async function getBlitzProjectForWallet(
  walletAddress: string,
): Promise<BlitzProjectResponse | null> {
  const row = await getBlitzProjectByWallet(walletAddress);
  if (!row) {
    return null;
  }
  return toBlitzProjectResponse(row);
}

export async function createBlitzProject(params: {
  walletAddress: string;
  github: string;
  description: string;
  workingLink?: string | null;
}): Promise<BlitzProjectResponse> {
  const existing = await getBlitzProjectByWallet(params.walletAddress);
  if (existing) {
    throw new BlitzAlreadySubmittedError();
  }

  const compliment = await generateBlitzCompliment({
    github: params.github,
    description: params.description,
    workingLink: params.workingLink,
  });

  const id = await insertBlitzProject({
    wallet_address: params.walletAddress,
    github: params.github,
    description: params.description,
    working_link: params.workingLink ?? null,
    status: "sent",
    compliment,
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
      compliment,
      github: params.github,
      description: params.description,
      workingLink: params.workingLink ?? null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "BLITZ transfer failed.";
    throw new Error(`${message} Your project was saved — contact support or retry.`);
  }
}
