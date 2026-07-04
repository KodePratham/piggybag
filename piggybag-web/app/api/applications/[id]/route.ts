import { type NextRequest, NextResponse } from "next/server";
import { continueApplication } from "@/lib/applications";
import { getApplication } from "@/lib/supabase";

export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: { answer?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { answer } = body;

  if (!answer?.trim()) {
    return NextResponse.json({ error: "An answer is required." }, { status: 400 });
  }

  try {
    const application = await getApplication(id);

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    if (application.status === "approved" || application.status === "rejected") {
      return NextResponse.json({ error: "Application is already finalized." }, { status: 400 });
    }

    const result = await continueApplication({
      id,
      walletAddress: application.wallet_address,
      answer: answer.trim(),
      existingConversation: application.conversation ?? [],
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process answer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
