"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { useMounted } from "@/lib/useMounted";
import { FUNDING_MIN_SCORE } from "@/lib/creditScore";
import type { CreditScoreResult } from "@/lib/types/transaction";

const EXPLORER_TX_URL = "https://testnet.monadscan.com/tx/";

type FundSuccess = {
  hash: string;
  score: number;
  rating: CreditScoreResult["rating"];
};

export function FundMe() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const [success, setSuccess] = useState<FundSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!mounted || !isConnected || !address) {
    return null;
  }

  async function handleFund() {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && typeof data.score === "number" && data.rating) {
          throw new Error(
            `Score ${data.score} (${data.rating}). Need ${data.minScore ?? FUNDING_MIN_SCORE}+ to qualify.`,
          );
        }

        throw new Error(data.error || "Failed to fund account.");
      }

      setSuccess({
        hash: data.hash as string,
        score: data.score as number,
        rating: data.rating as CreditScoreResult["rating"],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fund account.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-8 flex w-full max-w-sm flex-col items-center gap-4 border-t border-black/10 pt-8">
      <button
        type="button"
        onClick={handleFund}
        disabled={isLoading}
        className="border border-black px-8 py-3 text-sm uppercase tracking-widest transition-colors hover:bg-black hover:text-white disabled:opacity-50"
      >
        {isLoading ? "Analyzing wallet…" : "Request funding (1 MON)"}
      </button>

      <p className="max-w-xs text-center text-xs text-black/60">
        Requires credit score {FUNDING_MIN_SCORE}+ (Good or better)
      </p>

      {error && <p className="max-w-xs text-center text-xs text-black/60">{error}</p>}

      {success && (
        <p className="max-w-xs text-center text-xs text-black/60">
          Approved with score {success.score} ({success.rating}). Sent 1 MON.{" "}
          <a
            href={`${EXPLORER_TX_URL}${success.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-black underline-offset-4 hover:underline"
          >
            View transaction
          </a>
        </p>
      )}
    </div>
  );
}
