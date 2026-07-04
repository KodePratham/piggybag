export type ExplorerTransaction = {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  txreceipt_status?: string;
};

export type CreditScoreBreakdown = {
  transactionCount: number;
  accountAgeDays: number;
  uniqueCounterparties: number;
  successRate: number;
  activeWeeks: number;
  daysSinceLastTx: number;
  balanceMon: number;
};

export type CreditScoreMetadata = {
  dataSource: "explorer";
  historyTruncated: boolean;
};

export type CreditScoreOptions = {
  firstTxTimestampMs?: number;
  dataSource?: CreditScoreMetadata["dataSource"];
  historyTruncated?: boolean;
};

export type CreditScoreResult = {
  score: number;
  rating: "Poor" | "Fair" | "Good" | "Very Good" | "Excellent";
  breakdown: CreditScoreBreakdown;
  transactionsScanned: number;
  metadata: CreditScoreMetadata;
};
