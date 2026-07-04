"use client";

import { useAccount } from "wagmi";
import { useState } from "react";
import { useMounted } from "@/lib/useMounted";

const EXPLORER_TX_URL = "https://testnet.monadscan.com/tx/";

export function FundMe() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!mounted || !isConnected || !address) {
    return null;
  }

  async function handleFund() {
    setError(null);
    setHash(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fund account.");
      }

      setHash(data.hash as string);
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
        {isLoading ? "Funding…" : "Fund my account (0.1 MON)"}
      </button>

      {error && <p className="max-w-xs text-center text-xs text-black/60">{error}</p>}

      {hash && (
        <p className="max-w-xs text-center text-xs text-black/60">
          Sent 0.1 MON.{" "}
          <a
            href={`${EXPLORER_TX_URL}${hash}`}
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
