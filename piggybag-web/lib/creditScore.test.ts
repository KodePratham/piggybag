import { describe, expect, test } from "bun:test";
import { calculateCreditScore } from "./creditScore";
import type { ExplorerTransaction } from "./types/transaction";

const ADDRESS = "0x1234567890123456789012345678901234567890";
const DAY_MS = 24 * 60 * 60 * 1000;

function makeTx(
  timeStampSeconds: number,
  overrides: Partial<ExplorerTransaction> = {},
): ExplorerTransaction {
  return {
    hash: `0x${timeStampSeconds.toString(16).padStart(64, "0")}`,
    from: ADDRESS,
    to: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    value: "0",
    timeStamp: String(timeStampSeconds),
    isError: "0",
    txreceipt_status: "1",
    ...overrides,
  };
}

describe("calculateCreditScore", () => {
  test("returns zero account age and base score for empty wallet", () => {
    const now = Date.now();

    const result = calculateCreditScore(ADDRESS, [], 0n, {
      dataSource: "explorer",
      historyTruncated: false,
    });

    expect(result.breakdown.accountAgeDays).toBe(0);
    expect(result.breakdown.transactionCount).toBe(0);
    expect(result.transactionsScanned).toBe(0);
    expect(result.metadata.dataSource).toBe("explorer");
    expect(result.metadata.historyTruncated).toBe(false);
    expect(result.score).toBeGreaterThanOrEqual(300);
    expect(now).toBeLessThanOrEqual(Date.now());
  });

  test("uses first transaction timestamp for account age", () => {
    const firstTxMs = Date.now() - 45 * DAY_MS;
    const recentTx = makeTx(Math.floor(Date.now() / 1000));

    const result = calculateCreditScore(ADDRESS, [recentTx], 0n, {
      firstTxTimestampMs: firstTxMs,
      dataSource: "explorer",
    });

    expect(result.breakdown.accountAgeDays).toBeGreaterThanOrEqual(44);
    expect(result.breakdown.accountAgeDays).toBeLessThanOrEqual(45);
    expect(result.breakdown.daysSinceLastTx).toBeLessThanOrEqual(1);
  });

  test("uses recent activity transactions for recency and counts", () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const oldTx = makeTx(nowSeconds - 400 * 86400);
    const recentTx = makeTx(nowSeconds - 2 * 86400);

    const result = calculateCreditScore(ADDRESS, [oldTx, recentTx], 0n, {
      firstTxTimestampMs: (nowSeconds - 400 * 86400) * 1000,
      dataSource: "explorer",
      historyTruncated: true,
    });

    expect(result.breakdown.accountAgeDays).toBeGreaterThanOrEqual(399);
    expect(result.breakdown.daysSinceLastTx).toBe(2);
    expect(result.breakdown.transactionCount).toBe(2);
    expect(result.metadata.historyTruncated).toBe(true);
  });

  test("computes success rate from failed transactions in activity set", () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const txs = [
      makeTx(nowSeconds - 86400),
      makeTx(nowSeconds - 172800, { isError: "1", txreceipt_status: "0" }),
    ];

    const result = calculateCreditScore(ADDRESS, txs, 0n);

    expect(result.breakdown.successRate).toBe(0.5);
  });
});
