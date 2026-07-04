export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export type ProfileFields = {
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  isPublic: boolean;
};

export type ProfileUpdateInput = {
  username?: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  github?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  isPublic?: boolean;
};

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}

function stripAt(value: string): string {
  return value.trim().replace(/^@+/, "");
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeGithub(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (isValidHttpUrl(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }
  const handle = stripAt(trimmed);
  return handle ? `https://github.com/${handle}` : null;
}

export function normalizeTwitter(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (isValidHttpUrl(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }
  const handle = stripAt(trimmed);
  return handle ? `https://x.com/${handle}` : null;
}

export function normalizeLinkedin(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (isValidHttpUrl(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }
  const handle = stripAt(trimmed);
  return handle ? `https://linkedin.com/in/${handle}` : null;
}

export function normalizeAvatarUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (!isValidHttpUrl(trimmed)) {
    throw new Error("Avatar URL must be a valid http(s) link.");
  }
  return trimmed;
}

export function normalizeProfileUpdate(input: ProfileUpdateInput): ProfileFields {
  if (input.username === undefined || !input.username.trim()) {
    throw new Error("Username is required.");
  }

  const username = normalizeUsername(input.username);
  if (!isValidUsername(username)) {
    throw new Error("Username must be 3–20 characters: lowercase letters, numbers, or underscores.");
  }

  const displayName = input.displayName?.trim() || null;
  const bio = input.bio?.trim() || null;

  if (displayName && displayName.length > 80) {
    throw new Error("Display name must be 80 characters or fewer.");
  }

  if (bio && bio.length > 280) {
    throw new Error("Bio must be 280 characters or fewer.");
  }

  return {
    username,
    displayName,
    bio,
    avatarUrl: normalizeAvatarUrl(input.avatarUrl),
    github: normalizeGithub(input.github),
    twitter: normalizeTwitter(input.twitter),
    linkedin: normalizeLinkedin(input.linkedin),
    isPublic: Boolean(input.isPublic),
  };
}

export function getSocialLabel(url: string, platform: "github" | "twitter" | "linkedin"): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (platform === "github" && segments[0]) return segments[0];
    if (platform === "twitter" && segments[0]) return `@${segments[0]}`;
    if (platform === "linkedin" && segments[1]) return segments[1];
  } catch {
    // fall through
  }
  return url;
}
