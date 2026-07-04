"use client";

import { useState } from "react";
import { useSwitchChain, useWatchAsset } from "wagmi";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { addBlitzToMetaMask, resolveBlitzTokenAddress } from "@/lib/addBlitzToMetaMask";
import { useMounted } from "@/lib/useMounted";

type AddBlitzToWalletProps = {
  tokenAddress?: string;
};

export function AddBlitzToWallet({ tokenAddress }: AddBlitzToWalletProps) {
  const mounted = useMounted();
  const { switchChainAsync } = useSwitchChain();
  const { watchAssetAsync, isPending } = useWatchAsset();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const resolvedAddress = resolveBlitzTokenAddress(tokenAddress);

  if (!mounted || !resolvedAddress) {
    return null;
  }

  async function handleAdd() {
    setError(null);
    setSuccess(false);
    setIsAdding(true);

    try {
      await addBlitzToMetaMask(resolvedAddress!, {
        switchChain: switchChainAsync,
        watchAssetAsync,
      });
      setSuccess(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not add BLITZ to MetaMask.";
      setError(message);
    } finally {
      setIsAdding(false);
    }
  }

  const loading = isAdding || isPending;

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        label={loading ? "Adding…" : "Add BLITZ to MetaMask"}
        variant="secondary"
        onClick={handleAdd}
        isLoading={loading}
      />
      {success && (
        <Text type="supporting" color="secondary">
          BLITZ added — check Assets on Monad testnet.
        </Text>
      )}
      {error && (
        <Text type="supporting" color="secondary">
          {error}
        </Text>
      )}
    </div>
  );
}
