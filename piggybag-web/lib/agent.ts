import OpenAI from "openai";
import { getOpenAIApiKey } from "@/lib/env";

export type AgentStatus = "gathering" | "approved" | "rejected";

export type AgentMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentDecision = {
  status: AgentStatus;
  reply: string;
  amount_mon: number;
};

const MODEL = "gpt-4.1-mini";

/** Max user messages (initial application + follow-up answers) before a forced decision. */
export const MAX_USER_MESSAGES = 4;

const SYSTEM_PROMPT = `You are PiggyBag, an autonomous early-stage VC agent on Monad testnet.

Your job is to evaluate funding applications from builders. You receive their GitHub profile and project description.

Guidelines:
- Ask concise, focused clarifying questions (1-2 at a time) about the project, team, traction, and technical approach.
- Be skeptical but fair. Look for genuine builders with clear ideas, not vague pitches.
- Keep replies short (2-4 sentences max).
- You have at most ${MAX_USER_MESSAGES - 1} follow-up questions after the initial application. Make each question count.
- When approving, set amount_mon based on conviction: 1 (low), 2-3 (moderate), 4-5 (high). Only use whole numbers 1-5.
- When rejecting, explain briefly why.
- Set status to "gathering" while still asking questions.
- Set status to "approved" or "rejected" only when you have enough information to decide.`;

const FORCE_DECISION_PROMPT = `FINAL TURN: The applicant has reached the message limit. You MUST decide now.
Set status to "approved" or "rejected" — do NOT use "gathering".
If the project shows any reasonable promise, lean toward approving with a modest amount (1-2 MON).`;

const agentResponseSchema = {
  type: "object" as const,
  properties: {
    status: {
      type: "string" as const,
      enum: ["gathering", "approved", "rejected"],
    },
    reply: { type: "string" as const },
    amount_mon: { type: "number" as const },
  },
  required: ["status", "reply", "amount_mon"],
  additionalProperties: false,
};

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: getOpenAIApiKey(), timeout: 45_000 });
  }
  return openaiClient;
}

export function countUserMessages(messages: AgentMessage[]): number {
  return messages.filter((message) => message.role === "user").length;
}

export function shouldForceDecision(messages: AgentMessage[]): boolean {
  return countUserMessages(messages) >= MAX_USER_MESSAGES;
}

export function turnsRemaining(messages: AgentMessage[]): number {
  return Math.max(0, MAX_USER_MESSAGES - countUserMessages(messages));
}

export function clampAmount(amount: number): number {
  return Math.min(5, Math.max(1, Math.round(amount)));
}

function wrapOpenAIError(error: unknown): Error {
  if (error instanceof Error) {
    if (error.message.includes("fetch failed")) {
      return new Error(
        "Could not reach OpenAI. Check OPENAI_API_KEY in .env.local and your network connection.",
      );
    }
    return error;
  }
  return new Error("OpenAI request failed.");
}

export async function runAgentTurn(
  messages: AgentMessage[],
  options: { forceDecision?: boolean } = {},
): Promise<AgentDecision> {
  const forceDecision = options.forceDecision ?? shouldForceDecision(messages);

  const systemContent = forceDecision
    ? `${SYSTEM_PROMPT}\n\n${FORCE_DECISION_PROMPT}`
    : SYSTEM_PROMPT;

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: systemContent }, ...messages],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "agent_decision",
          strict: true,
          schema: agentResponseSchema,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Agent returned an empty response.");
    }

    const parsed = JSON.parse(content) as AgentDecision;

    if (forceDecision && parsed.status === "gathering") {
      parsed.status = "rejected";
      parsed.reply = `${parsed.reply} We've reached the question limit — please start a new application if you'd like to share more.`;
      parsed.amount_mon = 0;
    }

    if (parsed.status === "approved") {
      parsed.amount_mon = clampAmount(parsed.amount_mon);
    } else {
      parsed.amount_mon = 0;
    }

    return parsed;
  } catch (error) {
    throw wrapOpenAIError(error);
  }
}

export function buildInitialApplicationMessage(github: string, description: string): string {
  return `New funding application:

GitHub: ${github}

Project description:
${description}`;
}
