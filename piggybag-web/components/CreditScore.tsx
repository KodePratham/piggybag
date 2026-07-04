"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import type { CreditScoreResult } from "@/lib/types/transaction";
import { useMounted } from "@/lib/useMounted";

export function CreditScore() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const [result, setResult] = useState<CreditScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!mounted || !isConnected || !address) {
    return null;
  }

  async function handleCalculate() {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/credit-score?address=${address}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate credit score.");
      }

      setResult(data as CreditScoreResult);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Failed to calculate credit score.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-8 flex w-full max-w-sm flex-col items-center gap-6 border-t border-black/10 pt-8">
      <button
        type="button"
        onClick={handleCalculate}
        disabled={isLoading}
        className="border border-black bg-black px-8 py-3 text-sm uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
      >
        {isLoading ? "Scanning…" : "Calculate Credit Score"}
      </button>

      {error && <p className="max-w-xs text-center text-xs text-black/60">{error}</p>}

      {result && (
        <div className="flex w-full flex-col items-center gap-4 text-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-black/60">Credit Score</p>
            <p className="mt-2 text-6xl font-light tabular-nums">{result.score}</p>
            <p className="mt-1 text-sm uppercase tracking-widest">{result.rating}</p>
          </div>

          {result.metadata.historyTruncated && (
            <p className="max-w-xs text-center text-xs text-black/60">
              Activity metrics reflect the most recent {result.transactionsScanned} transactions
              only. Account age uses the wallet&apos;s first transaction.
            </p>
          )}

          <div className="grid w-full grid-cols-2 gap-x-6 gap-y-3 border border-black/10 p-4 text-left text-xs">
            <Stat label="Transactions scanned" value={String(result.transactionsScanned)} />
            <Stat
              label="Days since first transaction"
              value={`${result.breakdown.accountAgeDays} days`}
            />
            <Stat label="Unique addresses" value={String(result.breakdown.uniqueCounterparties)} />
            <Stat
              label="Success rate"
              value={`${Math.round(result.breakdown.successRate * 100)}%`}
            />
            <Stat label="Active weeks" value={String(result.breakdown.activeWeeks)} />
            <Stat label="Balance" value={`${result.breakdown.balanceMon.toFixed(4)} MON`} />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-black/60">{label}</p>
      <p className="mt-1 font-mono text-black">{value}</p>
    </div>
  );
}
