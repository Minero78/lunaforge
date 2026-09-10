"use client";

type AuthPayload = { access_token?: string; user?: unknown; [key: string]: unknown };
type AuthResult = { data: { user?: unknown; session?: unknown } | null; error: { message: string } | null };

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("SUPABASE_PUBLIC_CONFIG_MISSING");
  return { url: url.replace(/\/$/, ""), anonKey };
}

function persistAccessToken(accessToken: string | undefined) {
  if (!accessToken) return;
  document.cookie = `stratova-access-token=${encodeURIComponent(accessToken)}; Path=/; Max-Age=3600; SameSite=Lax`;
  window.localStorage.setItem("stratova-access-token", accessToken);
}

async function authRequest(path: string, body: unknown): Promise<AuthResult> {
  const { url, anonKey } = getConfig();
  const response = await fetch(`${url}/auth/v1/${path}`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data: AuthPayload = {};
  if (text) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (parsed && typeof parsed === "object") data = parsed as AuthPayload;
      else data = { message: text };
    } catch {
      data = { message: text };
    }
  }
  if (!response.ok) {
    const message = typeof data.msg === "string" ? data.msg : typeof data.message === "string" ? data.message : "Authentication request failed.";
    return { data: null, error: { message } };
  }
  persistAccessToken(data.access_token);
  return { data: { user: data.user, session: data }, error: null };
}

export function createSupabaseBrowserClient() {
  return {
    auth: {
      signInWithPassword: ({ email, password }: { email: string; password: string }) =>
        authRequest("token?grant_type=password", { email, password }),
      signUp: ({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, unknown> } }) =>
        authRequest("signup", { email, password, data: options?.data }),
    },
  };
}
