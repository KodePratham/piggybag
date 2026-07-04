import { type NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { createBlitzProject } from "@/lib/blitzProjects";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let body: {
    address?: string;
    github?: string;
    description?: string;
    workingLink?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { address, github, description, workingLink } = body;

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  if (!github?.trim()) {
    return NextResponse.json({ error: "GitHub repository is required." }, { status: 400 });
  }

  if (!description?.trim()) {
    return NextResponse.json({ error: "Project description is required." }, { status: 400 });
  }

  try {
    const result = await createBlitzProject({
      walletAddress: address.toLowerCase(),
      github: github.trim(),
      description: description.trim(),
      workingLink: workingLink?.trim() || null,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process blitz project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
