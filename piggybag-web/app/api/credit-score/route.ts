import { type NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getWalletCreditScore } from "@/lib/walletCreditScore";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  try {
    const result = await getWalletCreditScore(address);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to calculate credit score.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
