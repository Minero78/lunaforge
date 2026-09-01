type SupabaseConfig = {
  url: string;
  anonKey: string;
};

function getConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  return { url, anonKey };
}

/**
 * Minimal server-side Supabase REST client foundation.
 *
 * This deliberately avoids introducing a new runtime dependency at this stage.
 * The caller supplies the authenticated user's access token when RLS-backed
 * requests are made. Service-role credentials are never read by this module.
 */
export async function supabaseRequest<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const { url, anonKey } = getConfig();
  const headers = new Headers(init.headers);

  headers.set("apikey", anonKey);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`SUPABASE_REQUEST_FAILED:${response.status}:${detail}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
