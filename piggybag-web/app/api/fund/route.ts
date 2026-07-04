import { type NextRequest, NextResponse } from "next/server";
import { isAddress, parseEther, type Address } from "viem";
import { getAgentAccount, getAgentWalletClient } from "@/lib/agentWallet";
import { FUNDING_MIN_SCORE, isEligibleForFunding } from "@/lib/creditScore";
import { getWalletCreditScore } from "@/lib/walletCreditScore";
import { monadTestnet } from "viem/chains";

const FUND_AMOUNT_MON = "1";

export async function POST(request: NextRequest) {
  let body: { address?: string };

  try {
    body = (await request.json()) as { address?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { address } = body;

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  try {
    const creditResult = await getWalletCreditScore(address as Address);

    if (!isEligibleForFunding(creditResult.score)) {
      return NextResponse.json(
        {
          error: `Credit score ${creditResult.score} (${creditResult.rating}) does not meet the minimum of ${FUNDING_MIN_SCORE} (Good or better).`,
          score: creditResult.score,
          rating: creditResult.rating,
          minScore: FUNDING_MIN_SCORE,
        },
        { status: 403 },
      );
    }

    const hash = await getAgentWalletClient().sendTransaction({
      account: getAgentAccount(),
      chain: monadTestnet,
      to: address,
      value: parseEther(FUND_AMOUNT_MON),
    });

    return NextResponse.json({
      hash,
      score: creditResult.score,
      rating: creditResult.rating,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send funding transaction.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
