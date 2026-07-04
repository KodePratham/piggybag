"use client";

import { useAccount, useReadContract } from "wagmi";
import { monadTestnet } from "viem/chains";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { resolveBlitzTokenAddress } from "@/lib/addBlitzToMetaMask";
import { useMounted } from "@/lib/useMounted";

const EXPLORER_TOKEN_URL = "https://testnet.monadscan.com/token/";

const BALANCE_OF_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function formatBlitz(raw: bigint): string {
  const whole = raw / 10n ** 18n;
  return whole.toLocaleString();
}

export function BlitzBalance() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const tokenAddress = resolveBlitzTokenAddress();

  const { data, isLoading, isError, refetch, isRefetching } = useReadContract({
    abi: BALANCE_OF_ABI,
    address: tokenAddress as `0x${string}` | undefined,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: monadTestnet.id,
    query: {
      enabled: Boolean(mounted && isConnected && address && tokenAddress),
      refetchInterval: 15_000,
    },
  });

  if (!mounted || !isConnected || !address || !tokenAddress) {
    return null;
  }

  const explorerUrl = `${EXPLORER_TOKEN_URL}${tokenAddress}?a=${address}`;

  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Text type="label" color="secondary">
        Your $BLITZ balance
      </Text>
      {isLoading ? (
        <Text type="body">Loading…</Text>
      ) : isError ? (
        <Text type="supporting" color="secondary">
          Could not read balance from Monad testnet.
        </Text>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold">
            {formatBlitz((data as bigint | undefined) ?? 0n)}
          </span>
          <span className="text-sm text-[#8a8794]">$BLITZ</span>
        </div>
      )}
      <Link href={explorerUrl} isExternalLink label="View on MonadScan">
        View on MonadScan
      </Link>
      <Text type="supporting" color="secondary">
        MetaMask may not show this balance yet — the amount above is from the chain.
      </Text>
      <button
        type="button"
        onClick={() => refetch()}
        className="text-xs text-[#8a8794] underline underline-offset-2 hover:text-white disabled:opacity-50"
        disabled={isRefetching}
      >
        {isRefetching ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );
}
