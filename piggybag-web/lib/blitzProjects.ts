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

function hasBlitzTransfer(row: BlitzProjectRow): boolean {
  return Boolean(row.tx_hash && row.amount_blitz && row.amount_blitz > 0);
}

export async function getBlitzProjectForWallet(
  walletAddress: string,
): Promise<BlitzProjectResponse | null> {
  const row = await getBlitzProjectByWallet(walletAddress);
  if (!row || !hasBlitzTransfer(row)) {
    return null;
  }
  return toBlitzProjectResponse(row);
}

async function fundBlitzProject(params: {
  id: string;
  walletAddress: string;
  github: string;
  description: string;
  workingLink: string | null;
  compliment: string;
}): Promise<BlitzProjectResponse> {
  await updateBlitzProject(params.id, {
    status: "pending_transfer",
    updated_at: new Date().toISOString(),
  });

  try {
    const { txHash, amount } = await sendBlitzTokens(params.walletAddress);

    await updateBlitzProject(params.id, {
      status: "sent",
      amount_blitz: amount,
      tx_hash: txHash,
      updated_at: new Date().toISOString(),
    });

    return {
      id: params.id,
      txHash,
      amountBlitz: amount,
      tokenAddress: getBlitzTokenAddress(),
      compliment: params.compliment,
      github: params.github,
      description: params.description,
      workingLink: params.workingLink,
    };
  } catch (error) {
    await updateBlitzProject(params.id, {
      status: "transfer_failed",
      updated_at: new Date().toISOString(),
    });

    const message = error instanceof Error ? error.message : "BLITZ transfer failed.";
    throw new Error(`${message} Your project was saved — retry funding in a moment.`);
  }
}

export async function createBlitzProject(params: {
  walletAddress: string;
  github: string;
  description: string;
  workingLink?: string | null;
}): Promise<BlitzProjectResponse> {
  const existing = await getBlitzProjectByWallet(params.walletAddress);
  if (existing) {
    if (hasBlitzTransfer(existing)) {
      throw new BlitzAlreadySubmittedError();
    }

    const compliment =
      existing.compliment ??
      (await generateBlitzCompliment({
        github: existing.github,
        description: existing.description,
        workingLink: existing.working_link,
      }));

    if (!existing.compliment) {
      await updateBlitzProject(existing.id, {
        status: existing.status,
        compliment,
        updated_at: new Date().toISOString(),
      });
    }

    return fundBlitzProject({
      id: existing.id,
      walletAddress: params.walletAddress,
      github: existing.github,
      description: existing.description,
      workingLink: existing.working_link,
      compliment,
    });
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
    status: "pending_transfer",
    compliment,
  });

  return fundBlitzProject({
    id,
    walletAddress: params.walletAddress,
    github: params.github,
    description: params.description,
    workingLink: params.workingLink ?? null,
    compliment,
  });
}
