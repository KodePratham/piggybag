import type {
  CreditScoreOptions,
  CreditScoreResult,
  ExplorerTransaction,
} from "@/lib/types/transaction";

const BASE_SCORE = 300;
const MAX_SCORE = 850;

export const FUNDING_MIN_SCORE = 630;

export function isEligibleForFunding(score: number): boolean {
  return score >= FUNDING_MIN_SCORE;
}

function getRating(score: number): CreditScoreResult["rating"] {
  if (score >= 780) return "Excellent";
  if (score >= 700) return "Very Good";
  if (score >= 630) return "Good";
  if (score >= 580) return "Fair";
  return "Poor";
}

function getUniqueCounterparties(address: string, txs: ExplorerTransaction[]) {
  const normalized = address.toLowerCase();
  const counterparties = new Set<string>();

  for (const tx of txs) {
    if (tx.from.toLowerCase() !== normalized) {
      counterparties.add(tx.from.toLowerCase());
    }
    if (tx.to && tx.to.toLowerCase() !== normalized) {
      counterparties.add(tx.to.toLowerCase());
    }
  }

  return counterparties.size;
}

function getWeekKey(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.floor((date.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${date.getUTCFullYear()}-W${week}`;
}

function getActiveWeeks(txs: ExplorerTransaction[]) {
  const weeks = new Set<string>();

  for (const tx of txs) {
    weeks.add(getWeekKey(new Date(Number(tx.timeStamp) * 1000)));
  }

  return weeks.size;
}

function getSuccessRate(txs: ExplorerTransaction[]) {
  if (txs.length === 0) return 1;

  const successful = txs.filter(
    (tx) => tx.isError === "0" && (tx.txreceipt_status === undefined || tx.txreceipt_status === "1"),
  ).length;

  return successful / txs.length;
}

export function calculateCreditScore(
  address: string,
  txs: ExplorerTransaction[],
  balanceWei: bigint,
  options: CreditScoreOptions = {},
): CreditScoreResult {
  const now = Date.now();
  const sorted = [...txs].sort((a, b) => Number(a.timeStamp) - Number(b.timeStamp));
  const firstTimestamp =
    options.firstTxTimestampMs ?? (sorted[0] ? Number(sorted[0].timeStamp) * 1000 : now);
  const lastTimestamp = sorted[sorted.length - 1]
    ? Number(sorted[sorted.length - 1].timeStamp) * 1000
    : now;

  const accountAgeDays = Math.max(0, Math.floor((now - firstTimestamp) / (1000 * 60 * 60 * 24)));
  const daysSinceLastTx = Math.max(0, Math.floor((now - lastTimestamp) / (1000 * 60 * 60 * 24)));
  const transactionCount = txs.length;
  const uniqueCounterparties = getUniqueCounterparties(address, txs);
  const successRate = getSuccessRate(txs);
  const activeWeeks = getActiveWeeks(txs);
  const balanceMon = Number(balanceWei) / 1e18;

  const txCountPoints = Math.min(transactionCount * 4, 180);
  const agePoints = Math.min(accountAgeDays * 1.5, 120);
  const counterpartyPoints = Math.min(uniqueCounterparties * 8, 120);
  const successPoints = Math.round(successRate * 100);
  const consistencyPoints = Math.min(activeWeeks * 10, 80);
  const recencyPoints = daysSinceLastTx <= 7 ? 50 : daysSinceLastTx <= 30 ? 30 : daysSinceLastTx <= 90 ? 10 : 0;
  const balancePoints = Math.min(Math.floor(balanceMon * 10), 50);

  const score = Math.min(
    MAX_SCORE,
    Math.round(
      BASE_SCORE +
        txCountPoints +
        agePoints +
        counterpartyPoints +
        successPoints +
        consistencyPoints +
        recencyPoints +
        balancePoints,
    ),
  );

  return {
    score,
    rating: getRating(score),
    breakdown: {
      transactionCount,
      accountAgeDays,
      uniqueCounterparties,
      successRate,
      activeWeeks,
      daysSinceLastTx,
      balanceMon,
    },
    transactionsScanned: txs.length,
    metadata: {
      dataSource: options.dataSource ?? "explorer",
      historyTruncated: options.historyTruncated ?? false,
    },
  };
}
