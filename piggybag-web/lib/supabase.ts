import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AgentMessage } from "@/lib/agent";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

export type ApplicationRow = {
  id: string;
  wallet_address: string;
  github: string;
  description: string;
  status: string;
  amount_mon: number | null;
  tx_hash: string | null;
  conversation: AgentMessage[];
  created_at: string;
  updated_at: string;
};

export type ApplicationInsert = {
  wallet_address: string;
  github: string;
  description: string;
  status: string;
  amount_mon?: number | null;
  tx_hash?: string | null;
  conversation: AgentMessage[];
};

export type ApplicationUpdate = {
  status: string;
  amount_mon?: number | null;
  tx_hash?: string | null;
  conversation: AgentMessage[];
  updated_at: string;
};

export type BlitzProjectRow = {
  id: string;
  wallet_address: string;
  github: string;
  description: string;
  working_link: string | null;
  status: string;
  amount_blitz: number | null;
  tx_hash: string | null;
  compliment: string | null;
  created_at: string;
  updated_at: string;
};

export type BlitzProjectInsert = {
  wallet_address: string;
  github: string;
  description: string;
  working_link?: string | null;
  status: string;
  amount_blitz?: number | null;
  tx_hash?: string | null;
  compliment?: string | null;
};

export type BlitzProjectUpdate = {
  status: string;
  amount_blitz?: number | null;
  tx_hash?: string | null;
  compliment?: string | null;
  updated_at: string;
};

const BLITZ_PROJECT_COLUMNS =
  "id, wallet_address, github, description, working_link, status, amount_blitz, tx_hash, compliment, created_at, updated_at";

export type UserProfileRow = {
  id: string;
  wallet_address: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  is_public: boolean;
  created_at: string;
  last_seen_at: string;
};

export type UserProfileUpdate = {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  is_public: boolean;
};

const USER_PROFILE_COLUMNS =
  "id, wallet_address, username, display_name, bio, avatar_url, github, twitter, linkedin, is_public, created_at, last_seen_at";

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseAdmin;
}

function wrapSupabaseError(error: unknown, action: string): Error {
  if (error instanceof Error) {
    if (error.message.includes("fetch failed")) {
      return new Error(
        `Could not reach Supabase while ${action}. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then restart the dev server.`,
      );
    }
    return error;
  }
  return new Error(`Supabase error while ${action}.`);
}

export async function insertApplication(row: ApplicationInsert): Promise<string> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("applications")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data.id;
  } catch (error) {
    throw wrapSupabaseError(error, "creating application");
  }
}

export async function getApplication(id: string): Promise<ApplicationRow | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("applications")
      .select(
        "id, wallet_address, github, description, status, amount_mon, tx_hash, conversation, created_at, updated_at",
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(error.message);
    }

    return data as ApplicationRow;
  } catch (error) {
    throw wrapSupabaseError(error, "loading application");
  }
}

export async function updateApplication(id: string, row: ApplicationUpdate): Promise<void> {
  try {
    const { error } = await getSupabaseAdmin().from("applications").update(row).eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw wrapSupabaseError(error, "updating application");
  }
}

export async function insertBlitzProject(row: BlitzProjectInsert): Promise<string> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("blitz_projects")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data.id;
  } catch (error) {
    throw wrapSupabaseError(error, "creating blitz project");
  }
}

export async function updateBlitzProject(id: string, row: BlitzProjectUpdate): Promise<void> {
  try {
    const { error } = await getSupabaseAdmin().from("blitz_projects").update(row).eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw wrapSupabaseError(error, "updating blitz project");
  }
}

export async function getBlitzProjectByWallet(
  walletAddress: string,
): Promise<BlitzProjectRow | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("blitz_projects")
      .select(BLITZ_PROJECT_COLUMNS)
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data as BlitzProjectRow | null;
  } catch (error) {
    throw wrapSupabaseError(error, "loading blitz project");
  }
}

export async function upsertUser(walletAddress: string): Promise<void> {
  try {
    const { error } = await getSupabaseAdmin()
      .from("users")
      .upsert(
        {
          wallet_address: walletAddress,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "wallet_address" },
      );

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw wrapSupabaseError(error, "registering wallet");
  }
}

export async function getProfileByWallet(walletAddress: string): Promise<UserProfileRow | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("users")
      .select(USER_PROFILE_COLUMNS)
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data as UserProfileRow | null;
  } catch (error) {
    throw wrapSupabaseError(error, "loading profile");
  }
}

export async function getPublicProfileByUsername(username: string): Promise<UserProfileRow | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("users")
      .select(USER_PROFILE_COLUMNS)
      .ilike("username", username)
      .eq("is_public", true)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data as UserProfileRow | null;
  } catch (error) {
    throw wrapSupabaseError(error, "loading public profile");
  }
}

export async function isUsernameAvailable(username: string, walletAddress: string): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("users")
      .select("wallet_address")
      .ilike("username", username)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return true;
    }

    return data.wallet_address === walletAddress;
  } catch (error) {
    throw wrapSupabaseError(error, "checking username availability");
  }
}

export async function updateProfile(
  walletAddress: string,
  fields: UserProfileUpdate,
): Promise<UserProfileRow> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("users")
      .upsert(
        {
          wallet_address: walletAddress,
          username: fields.username,
          display_name: fields.display_name,
          bio: fields.bio,
          avatar_url: fields.avatar_url,
          github: fields.github,
          twitter: fields.twitter,
          linkedin: fields.linkedin,
          is_public: fields.is_public,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "wallet_address" },
      )
      .select(USER_PROFILE_COLUMNS)
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("That username is already taken.");
      }
      throw new Error(error.message);
    }

    return data as UserProfileRow;
  } catch (error) {
    if (error instanceof Error && error.message === "That username is already taken.") {
      throw error;
    }
    throw wrapSupabaseError(error, "updating profile");
  }
}
