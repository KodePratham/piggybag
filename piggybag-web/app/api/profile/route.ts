import { type NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import {
  isValidUsername,
  normalizeProfileUpdate,
  type ProfileUpdateInput,
} from "@/lib/profileValidation";
import { getProfileByWallet, isUsernameAvailable, updateProfile } from "@/lib/supabase";

function serializeProfile(profile: Awaited<ReturnType<typeof getProfileByWallet>>) {
  if (!profile) return null;

  return {
    username: profile.username,
    displayName: profile.display_name,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    github: profile.github,
    twitter: profile.twitter,
    linkedin: profile.linkedin,
    isPublic: profile.is_public,
  };
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  try {
    const profile = await getProfileByWallet(address.toLowerCase());
    return NextResponse.json({ profile: serializeProfile(profile) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  let body: ProfileUpdateInput & { address?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { address, ...input } = body;

  if (!address || !isAddress(address)) {
    return NextResponse.json({ error: "A valid wallet address is required." }, { status: 400 });
  }

  const walletAddress = address.toLowerCase();

  try {
    const fields = normalizeProfileUpdate(input);

    if (!isValidUsername(fields.username)) {
      return NextResponse.json(
        { error: "Username must be 3–20 characters: lowercase letters, numbers, or underscores." },
        { status: 400 },
      );
    }

    const available = await isUsernameAvailable(fields.username, walletAddress);
    if (!available) {
      return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
    }

    const profile = await updateProfile(walletAddress, {
      username: fields.username,
      display_name: fields.displayName,
      bio: fields.bio,
      avatar_url: fields.avatarUrl,
      github: fields.github,
      twitter: fields.twitter,
      linkedin: fields.linkedin,
      is_public: fields.isPublic,
    });

    return NextResponse.json({ profile: serializeProfile(profile) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save profile.";
    const status = message.includes("already taken") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}
