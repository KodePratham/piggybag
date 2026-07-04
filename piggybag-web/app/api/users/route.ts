import { type NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  let body: { address?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { address } = body;

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  const walletAddress = address.toLowerCase();

  const { error } = await supabaseAdmin.from("users").upsert(
    {
      wallet_address: walletAddress,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "wallet_address" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
