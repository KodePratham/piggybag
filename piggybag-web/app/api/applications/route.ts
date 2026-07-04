import { type NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { createApplication } from "@/lib/applications";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let body: { address?: string; github?: string; description?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { address, github, description } = body;

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  if (!github?.trim()) {
    return NextResponse.json({ error: "GitHub profile is required." }, { status: 400 });
  }

  if (!description?.trim()) {
    return NextResponse.json({ error: "Project description is required." }, { status: 400 });
  }

  try {
    const result = await createApplication({
      walletAddress: address.toLowerCase(),
      github: github.trim(),
      description: description.trim(),
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process application.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
