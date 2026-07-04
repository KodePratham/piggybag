import { type NextRequest, NextResponse } from "next/server";
import { isAddress, parseEther } from "viem";
import { getAgentAccount, getAgentWalletClient } from "@/lib/agentWallet";
import { monadTestnet } from "viem/chains";

const FUND_AMOUNT_MON = "0.1";

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
    const hash = await getAgentWalletClient().sendTransaction({
      account: getAgentAccount(),
      chain: monadTestnet,
      to: address,
      value: parseEther(FUND_AMOUNT_MON),
    });

    return NextResponse.json({ hash });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send funding transaction.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
