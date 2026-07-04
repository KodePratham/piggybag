"use client";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new Error("Server returned an empty response.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Server returned an invalid response.");
  }
}

export async function postJson<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return {
      ok: false,
      error: "Could not reach the server. Make sure the dev server is running and restart it after changing .env.local.",
    };
  }

  const data = await parseJsonResponse<{ error?: string } & T>(response);

  if (!response.ok) {
    return { ok: false, error: data.error || "Request failed." };
  }

  return { ok: true, data };
}

export async function getJson<T>(url: string): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  let response: Response;

  try {
    response = await fetch(url);
  } catch {
    return {
      ok: false,
      error: "Could not reach the server. Make sure the dev server is running and restart it after changing .env.local.",
    };
  }

  const data = await parseJsonResponse<{ error?: string } & T>(response);

  if (!response.ok) {
    return { ok: false, error: data.error || "Request failed." };
  }

  return { ok: true, data };
}
