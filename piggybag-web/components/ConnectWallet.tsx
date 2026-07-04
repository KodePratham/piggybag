"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { monadTestnet } from "viem/chains";
import { useEffect, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { useMounted } from "@/lib/useMounted";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

type ConnectWalletProps = {
  compact?: boolean;
};

export function ConnectWallet({ compact = false }: ConnectWalletProps) {
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
      <Button
        label={compact ? "Connect" : "Connect Wallet"}
        variant="secondary"
        size={compact ? "sm" : "md"}
        isDisabled
      />
    );
  }

  if (isConnected && address) {
    return (
      <HStack gap={2} align="center">
        <Text type="label" color="secondary">
          {truncateAddress(address)}
        </Text>
        <Button
          label="Disconnect"
          variant="ghost"
          size="sm"
          onClick={() => disconnect()}
        />
      </HStack>
    );
  }

  return (
    <HStack gap={2} align="center">
      <Button
        label={isPending ? "Connecting…" : compact ? "Connect" : "Connect Wallet"}
        variant="primary"
        size={compact ? "sm" : "md"}
        isLoading={isPending}
        onClick={handleConnect}
      />
      {error && (
        <Text type="supporting" color="secondary">
          {error}
        </Text>
      )}
    </HStack>
  );
}
