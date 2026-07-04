import { type NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { upsertUser } from "@/lib/supabase";

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

  try {
    await upsertUser(address.toLowerCase());
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to register wallet.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
