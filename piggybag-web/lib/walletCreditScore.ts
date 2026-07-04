import { createPublicClient, http, type Address } from "viem";
import { monadTestnet } from "viem/chains";
import { calculateCreditScore } from "@/lib/creditScore";
import type { CreditScoreResult, ExplorerTransaction } from "@/lib/types/transaction";

const EXPLORER_API = "https://api.etherscan.io/v2/api";
const CHAIN_ID = "10143"; // Monad testnet
const MAX_TRANSACTIONS = 500;

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

type ExplorerResponse = {
  status: string;
  message: string;
  result: ExplorerTransaction[] | string;
};

async function fetchExplorerTxs(
  address: Address,
  sort: "asc" | "desc",
  offset: number,
  page = 1,
): Promise<ExplorerTransaction[]> {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ETHERSCAN_API_KEY.");
  }

  const params = new URLSearchParams({
    chainid: CHAIN_ID,
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "99999999",
    page: String(page),
    offset: String(offset),
    sort,
    apikey: apiKey,
  });

  const response = await fetch(`${EXPLORER_API}?${params.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch transaction history from Etherscan.");
  }

  const data = (await response.json()) as ExplorerResponse;

  if (data.status !== "1" || !Array.isArray(data.result)) {
    if (data.message === "No transactions found" || data.result === "No transactions found") {
      return [];
    }
    throw new Error(
      typeof data.result === "string" ? data.result : "Unable to load transaction history.",
    );
  }

  return data.result;
}

async function fetchWalletTransactionHistory(address: Address): Promise<{
  activityTxs: ExplorerTransaction[];
  firstTxTimestampMs: number | undefined;
  historyTruncated: boolean;
}> {
  const [oldestBatch, recentTxs] = await Promise.all([
    fetchExplorerTxs(address, "asc", 1),
    fetchExplorerTxs(address, "desc", MAX_TRANSACTIONS),
  ]);

  const firstTxTimestampMs = oldestBatch[0]
    ? Number(oldestBatch[0].timeStamp) * 1000
    : undefined;

  return {
    activityTxs: recentTxs,
    firstTxTimestampMs,
    historyTruncated: recentTxs.length === MAX_TRANSACTIONS,
  };
}

export async function getWalletCreditScore(address: Address): Promise<CreditScoreResult> {
  const balance = await publicClient.getBalance({ address });
  const { activityTxs, firstTxTimestampMs, historyTruncated } =
    await fetchWalletTransactionHistory(address);

  return calculateCreditScore(address, activityTxs, balance, {
    firstTxTimestampMs,
    dataSource: "explorer",
    historyTruncated,
  });
}
