import { runAgentTurn, turnsRemaining, buildInitialApplicationMessage, type AgentMessage } from "@/lib/agent";
import { sendFundingIfApproved } from "@/lib/applicationFunding";
import { insertApplication, updateApplication } from "@/lib/supabase";

export type ApplicationResponse = {
  id: string;
  status: string;
  reply: string;
  amountMon?: number;
  hash?: string;
  turnsRemaining: number;
};

export async function createApplication(params: {
  walletAddress: string;
  github: string;
  description: string;
}): Promise<ApplicationResponse> {
  const initialMessage: AgentMessage = {
    role: "user",
    content: buildInitialApplicationMessage(params.github, params.description),
  };

  const decision = await runAgentTurn([initialMessage]);

  const conversation: AgentMessage[] = [
    initialMessage,
    { role: "assistant", content: decision.reply },
  ];

  const id = await insertApplication({
    wallet_address: params.walletAddress,
    github: params.github,
    description: params.description,
    status: decision.status,
    conversation,
  });

  let txHash: string | null = null;
  let amountMon: number | null = null;

  if (decision.status === "approved") {
    try {
      const funding = await sendFundingIfApproved(decision, params.walletAddress);
      txHash = funding.txHash;
      amountMon = funding.amountMon;

      await updateApplication(id, {
        status: decision.status,
        amount_mon: amountMon,
        tx_hash: txHash,
        conversation,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Funding failed.";
      throw new Error(`${message} Your application was approved — contact support or retry funding.`);
    }
  }

  return {
    id,
    status: decision.status,
    reply: decision.reply,
    amountMon: amountMon ?? undefined,
    hash: txHash ?? undefined,
    turnsRemaining: turnsRemaining(conversation),
  };
}

export async function continueApplication(params: {
  id: string;
  walletAddress: string;
  answer: string;
  existingConversation: AgentMessage[];
}): Promise<Omit<ApplicationResponse, "id">> {
  const conversation: AgentMessage[] = [
    ...params.existingConversation,
    { role: "user", content: params.answer },
  ];

  const decision = await runAgentTurn(conversation);

  conversation.push({ role: "assistant", content: decision.reply });

  await updateApplication(params.id, {
    status: decision.status,
    amount_mon: decision.status === "approved" ? decision.amount_mon : null,
    tx_hash: null,
    conversation,
    updated_at: new Date().toISOString(),
  });

  let txHash: string | null = null;
  let amountMon: number | null = null;

  if (decision.status === "approved") {
    try {
      const funding = await sendFundingIfApproved(decision, params.walletAddress);
      txHash = funding.txHash;
      amountMon = funding.amountMon;

      await updateApplication(params.id, {
        status: decision.status,
        amount_mon: amountMon,
        tx_hash: txHash,
        conversation,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Funding failed.";
      throw new Error(`${message} Your application was approved — contact support or retry funding.`);
    }
  }

  return {
    status: decision.status,
    reply: decision.reply,
    amountMon: amountMon ?? undefined,
    hash: txHash ?? undefined,
    turnsRemaining: turnsRemaining(conversation),
  };
}
