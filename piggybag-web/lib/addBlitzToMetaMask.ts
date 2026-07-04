import { monadTestnet } from "viem/chains";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
};

export type WatchAssetParams = {
  type: "ERC20";
  options: {
    address: `0x${string}`;
    symbol: string;
    decimals: number;
    image: string;
  };
};

export type AddBlitzToMetaMaskDeps = {
  switchChain?: (args: { chainId: number }) => Promise<unknown>;
  watchAssetAsync?: (params: WatchAssetParams) => Promise<boolean>;
};

export const PUBLIC_BLITZ_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_BLITZ_TOKEN_ADDRESS?.trim();

export function resolveBlitzTokenAddress(address?: string): string | undefined {
  const resolved = address?.trim() || PUBLIC_BLITZ_TOKEN_ADDRESS;
  return resolved || undefined;
}

function getEthereumProvider(): EthereumProvider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum;
}

function buildWatchAssetParams(tokenAddress: string): WatchAssetParams {
  return {
    type: "ERC20",
    options: {
      address: tokenAddress as `0x${string}`,
      symbol: "BLITZ",
      decimals: 18,
      image: `${window.location.origin}/blitzcoin.png`,
    },
  };
}

async function ensureMonadTestnet(
  provider: EthereumProvider,
  switchChain?: AddBlitzToMetaMaskDeps["switchChain"],
) {
  if (switchChain) {
    try {
      await switchChain({ chainId: monadTestnet.id });
      return;
    } catch {
      // Fall through to direct provider request.
    }
  }

  const chainIdHex = `0x${monadTestnet.id.toString(16)}`;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (error) {
    const err = error as { code?: number };
    if (err.code !== 4902) {
      throw error;
    }

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName: monadTestnet.name,
          nativeCurrency: monadTestnet.nativeCurrency,
          rpcUrls: monadTestnet.rpcUrls.default.http,
          blockExplorerUrls: monadTestnet.blockExplorers?.default
            ? [monadTestnet.blockExplorers.default.url]
            : undefined,
        },
      ],
    });
  }
}

export async function addBlitzToMetaMask(
  tokenAddress: string,
  deps?: AddBlitzToMetaMaskDeps,
): Promise<void> {
  const address = resolveBlitzTokenAddress(tokenAddress);
  if (!address) {
    throw new Error("BLITZ token address is not configured.");
  }

  const params = buildWatchAssetParams(address);
  const provider = getEthereumProvider();

  if (provider) {
    await ensureMonadTestnet(provider, deps?.switchChain);
    await provider.request({
      method: "wallet_watchAsset",
      params,
    });
    return;
  }

  if (deps?.switchChain) {
    await deps.switchChain({ chainId: monadTestnet.id });
  }

  if (deps?.watchAssetAsync) {
    await deps.watchAssetAsync(params);
    return;
  }

  throw new Error("No wallet found. Install MetaMask.");
}
