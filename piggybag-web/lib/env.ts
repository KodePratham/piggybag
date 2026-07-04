function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.local and restart the dev server.`);
  }
  return value;
}

export function getSupabaseUrl(): string {
  return getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseServiceRoleKey(): string {
  return getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getOpenAIApiKey(): string {
  return getRequiredEnv("OPENAI_API_KEY");
}

export function getAgentPrivateKey(): string {
  return getRequiredEnv("AGENT_PRIVATE_KEY");
}
