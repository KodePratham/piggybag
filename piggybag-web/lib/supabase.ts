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
