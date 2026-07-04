"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { useMounted } from "@/lib/useMounted";
import { postJson } from "@/lib/apiClient";

const EXPLORER_TX_URL = "https://testnet.monadscan.com/tx/";

type AgentStatus = "gathering" | "approved" | "rejected";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ApplicationState = {
  id: string;
  status: AgentStatus;
  messages: ChatMessage[];
  amountMon?: number;
  hash?: string;
  turnsRemaining: number;
};

export function FundingAgent() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();

  const [github, setGithub] = useState("");
  const [description, setDescription] = useState("");
  const [answer, setAnswer] = useState("");
  const [application, setApplication] = useState<ApplicationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!mounted || !isConnected || !address) {
    return null;
  }

  async function handleSubmitApplication(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await postJson<{
        id: string;
        status: AgentStatus;
        reply: string;
        amountMon?: number;
        hash?: string;
        turnsRemaining?: number;
      }>("/api/applications", { address, github, description });

      if (!result.ok) {
        throw new Error(result.error);
      }

      const data = result.data;

      setApplication({
        id: data.id,
        status: data.status,
        messages: [{ role: "assistant", content: data.reply }],
        amountMon: data.amountMon,
        hash: data.hash,
        turnsRemaining: data.turnsRemaining ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitAnswer(event: React.FormEvent) {
    event.preventDefault();
    if (!application || !answer.trim()) return;

    setError(null);
    setIsLoading(true);

    const userMessage = answer.trim();
    setAnswer("");

    try {
      const result = await postJson<{
        status: AgentStatus;
        reply: string;
        amountMon?: number;
        hash?: string;
        turnsRemaining?: number;
      }>(`/api/applications/${application.id}`, { answer: userMessage });

      if (!result.ok) {
        throw new Error(result.error);
      }

      const data = result.data;

      setApplication((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: data.status,
          messages: [
            ...prev.messages,
            { role: "user", content: userMessage },
            { role: "assistant", content: data.reply },
          ],
          amountMon: data.amountMon,
          hash: data.hash,
          turnsRemaining: data.turnsRemaining ?? 0,
        };
      });
    } catch (err) {
      setAnswer(userMessage);
      setError(err instanceof Error ? err.message : "Failed to send answer.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewApplication() {
    setApplication(null);
    setGithub("");
    setDescription("");
    setAnswer("");
    setError(null);
  }

  if (!application) {
    return (
      <div className="mt-8 flex w-full max-w-md flex-col items-center gap-6 border-t border-black/10 pt-8">
        <p className="text-xs uppercase tracking-widest text-black/60">Apply for funding</p>

        <form onSubmit={handleSubmitApplication} className="flex w-full flex-col gap-4">
          <label className="flex flex-col gap-2 text-left">
            <span className="text-xs uppercase tracking-widest text-black/60">GitHub</span>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="github.com/username"
              required
              className="border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </label>

          <label className="flex flex-col gap-2 text-left">
            <span className="text-xs uppercase tracking-widest text-black/60">Project</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're building..."
              required
              rows={4}
              className="resize-none border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="border border-black px-8 py-3 text-sm uppercase tracking-widest transition-colors hover:bg-black hover:text-white disabled:opacity-50"
          >
            {isLoading ? "Submitting…" : "Submit application"}
          </button>
        </form>

        {error && <p className="max-w-xs text-center text-xs text-black/60">{error}</p>}
      </div>
    );
  }

  const isFinalized = application.status === "approved" || application.status === "rejected";
  const isLastQuestion = application.turnsRemaining <= 1;

  return (
    <div className="mt-8 flex w-full max-w-md flex-col items-center gap-6 border-t border-black/10 pt-8">
      <p className="text-xs uppercase tracking-widest text-black/60">PiggyBag agent</p>

      {!isFinalized && application.turnsRemaining > 0 && (
        <p className="text-xs text-black/60">
          {isLastQuestion
            ? "Final answer — the agent will decide and send funds immediately if approved."
            : `${application.turnsRemaining} answer${application.turnsRemaining === 1 ? "" : "s"} remaining before decision`}
        </p>
      )}

      <div className="flex w-full flex-col gap-4">
        {application.messages.map((message, index) => (
          <div
            key={index}
            className={`text-sm ${message.role === "assistant" ? "text-black" : "text-black/60"}`}
          >
            <p className="mb-1 text-xs uppercase tracking-widest">
              {message.role === "assistant" ? "Agent" : "You"}
            </p>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      {application.status === "approved" && (
        <div className="flex w-full flex-col items-center gap-2 text-center">
          <p className="text-xs uppercase tracking-widest text-black/60">Approved</p>
          <p className="text-sm">
            {application.amountMon} MON sent to your wallet.
          </p>
          {application.hash && (
            <a
              href={`${EXPLORER_TX_URL}${application.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-black underline-offset-4 hover:underline"
            >
              View transaction
            </a>
          )}
        </div>
      )}

      {application.status === "rejected" && (
        <div className="flex w-full flex-col items-center gap-2 text-center">
          <p className="text-xs uppercase tracking-widest text-black/60">Not funded</p>
        </div>
      )}

      {!isFinalized && (
        <form onSubmit={handleSubmitAnswer} className="flex w-full flex-col gap-4">
          <label className="flex flex-col gap-2 text-left">
            <span className="text-xs uppercase tracking-widest text-black/60">Your answer</span>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer the agent's question..."
              required
              rows={3}
              className="resize-none border border-black/20 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="border border-black px-8 py-3 text-sm uppercase tracking-widest transition-colors hover:bg-black hover:text-white disabled:opacity-50"
          >
            {isLoading
              ? isLastQuestion
                ? "Deciding & sending…"
                : "Sending…"
              : isLastQuestion
                ? "Submit final answer"
                : "Send answer"}
          </button>
        </form>
      )}

      {error && <p className="max-w-xs text-center text-xs text-black/60">{error}</p>}

      {isFinalized && (
        <button
          type="button"
          onClick={handleNewApplication}
          className="text-xs uppercase tracking-widest text-black/60 underline-offset-4 hover:underline"
        >
          New application
        </button>
      )}
    </div>
  );
}
