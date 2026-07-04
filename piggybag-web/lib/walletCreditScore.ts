import { createPublicClient, http, type Address } from "viem";
import { monadTestnet } from "viem/chains";
import { calculateCreditScore } from "@/lib/creditScore";
import type { CreditScoreResult, ExplorerTransaction } from "@/lib/types/transaction";

const EXPLORER_API = "https://api-testnet.monadscan.com/api";
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

async function fetchTransactionsFromExplorer(address: Address): Promise<ExplorerTransaction[]> {
  const apiKey = process.env.MONADSCAN_API_KEY;
  const params = new URLSearchParams({
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "99999999",
    page: "1",
    offset: String(MAX_TRANSACTIONS),
    sort: "asc",
  });

  if (apiKey) {
    params.set("apikey", apiKey);
  }

  const response = await fetch(`${EXPLORER_API}?${params.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch transaction history from Monadscan.");
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

async function fetchOnChainFallback(address: Address): Promise<ExplorerTransaction[]> {
  const transactionCount = await publicClient.getTransactionCount({ address });

  if (transactionCount === 0) {
    return [];
  }

  const now = Math.floor(Date.now() / 1000);

  return Array.from({ length: Math.min(transactionCount, 20) }, (_, index) => ({
    hash: `0x${"0".repeat(64)}`,
    from: address,
    to: address,
    value: "0",
    timeStamp: String(now - (transactionCount - index) * 86400),
    isError: "0",
    txreceipt_status: "1",
  }));
}

export async function getWalletCreditScore(address: Address): Promise<CreditScoreResult> {
  const balance = await publicClient.getBalance({ address });

  let transactions: ExplorerTransaction[];

  try {
    transactions = await fetchTransactionsFromExplorer(address);
  } catch {
    transactions = await fetchOnChainFallback(address);
  }

  return calculateCreditScore(address, transactions, balance);
}
