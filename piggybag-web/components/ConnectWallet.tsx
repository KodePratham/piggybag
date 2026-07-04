"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { monadTestnet } from "viem/chains";
import { useEffect, useState } from "react";
import { useMounted } from "@/lib/useMounted";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectWallet() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      return;
    }

    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    }).catch((err) => {
      console.error("Failed to register wallet:", err);
    });
  }, [address, isConnected]);

  async function handleConnect() {
    setError(null);
    const connector = connectors[0];
    if (!connector) {
      setError("No wallet found. Install MetaMask or another browser wallet.");
      return;
    }

    connect(
      { connector, chainId: monadTestnet.id },
      {
        onSuccess: () => {
          switchChain(
            { chainId: monadTestnet.id },
            {
              onError: () => {
                setError("Connected, but could not switch to Monad Testnet.");
              },
            },
          );
        },
        onError: (err) => {
          setError(err.message || "Failed to connect wallet.");
        },
      },
    );
  }

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          disabled
          className="border border-black px-8 py-3 text-sm uppercase tracking-widest transition-colors hover:bg-black hover:text-white disabled:opacity-50"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="font-mono text-sm tracking-wide">{truncateAddress(address)}</p>
        <button
          type="button"
          onClick={() => disconnect()}
          className="text-xs uppercase tracking-widest text-black/60 underline-offset-4 hover:underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleConnect}
        disabled={isPending}
        className="border border-black px-8 py-3 text-sm uppercase tracking-widest transition-colors hover:bg-black hover:text-white disabled:opacity-50"
      >
        {isPending ? "Connecting…" : "Connect Wallet"}
      </button>
      {error && <p className="max-w-xs text-center text-xs text-black/60">{error}</p>}
    </div>
  );
}
