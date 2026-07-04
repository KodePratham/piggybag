import { type NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { isValidUsername, normalizeUsername } from "@/lib/profileValidation";
import { isUsernameAvailable } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const usernameParam = request.nextUrl.searchParams.get("username");
  const address = request.nextUrl.searchParams.get("address");

  if (!usernameParam) {
    return NextResponse.json({ error: "Username is required." }, { status: 400 });
  }

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  const username = normalizeUsername(usernameParam);

  if (!isValidUsername(username)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  try {
    const available = await isUsernameAvailable(username, address.toLowerCase());
    return NextResponse.json({ available });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check username.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
