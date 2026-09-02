import { cookies } from "next/headers";

type SupabaseConfig = { url: string; anonKey: string };
type SupabaseError = { message: string } | null;
type SupabaseResult<T> = { data: T | null; error: SupabaseError };

type QueryOperation = "select" | "insert" | "upsert" | "update";

type QueryState = {
  table: string;
  operation: QueryOperation;
  payload?: unknown;
  select?: string;
  filters: Array<[string, string, string]>;
  order?: { column: string; ascending: boolean };
  limit?: number;
  onConflict?: string;
};

function getConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("SUPABASE_NOT_CONFIGURED");
  return { url: url.replace(/\/$/, ""), anonKey };
}

function decodeCookieToken(value: string): string {
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("base64-")) return atob(decoded.slice(7));
    if (decoded.startsWith("[")) {
      const parsed = JSON.parse(decoded) as unknown;
      if (Array.isArray(parsed)) return parsed.join("");
    }
    return decoded;
  } catch {
    return value;
  }
}

async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const direct = cookieStore.get("stratova-access-token")?.value;
  if (direct) return decodeCookieToken(direct);

  const authCookie = cookieStore.getAll().find((cookie) => cookie.name.includes("auth-token"));
  return authCookie?.value ? decodeCookieToken(authCookie.value) : undefined;
}

class QueryBuilder<T = Record<string, unknown>> implements PromiseLike<SupabaseResult<T | T[]>> {
  private state: QueryState;
  private singleMode: "single" | "maybeSingle" | null = null;

  constructor(table: string, operation: QueryOperation = "select", payload?: unknown) {
    this.state = { table, operation, payload, filters: [] };
  }

  select(columns = "*") {
    this.state.select = columns;
    return this;
  }

  eq(column: string, value: string | number | boolean | null) {
    this.state.filters.push([column, "eq", String(value)]);
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.state.order = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.state.limit = count;
    return this;
  }

  single() {
    this.singleMode = "single";
    return this as unknown as PromiseLike<SupabaseResult<T>>;
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this as unknown as PromiseLike<SupabaseResult<T | null>>;
  }

  insert(payload: unknown) {
    this.state.operation = "insert";
    this.state.payload = payload;
    return this;
  }

  upsert(payload: unknown, options: { onConflict?: string } = {}) {
    this.state.operation = "upsert";
    this.state.payload = payload;
    this.state.onConflict = options.onConflict;
    return this;
  }

  update(payload: unknown) {
    this.state.operation = "update";
    this.state.payload = payload;
    return this;
  }

  then<TResult1 = SupabaseResult<T | T[]>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseResult<T | T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<SupabaseResult<T | T[]>> {
    const { url, anonKey } = getConfig();
    const token = await getAccessToken();
    const params = new URLSearchParams();
    if (this.state.select) params.set("select", this.state.select);
    for (const [column, operator, value] of this.state.filters) params.set(column, `${operator}.${value}`);
    if (this.state.order) params.set("order", `${this.state.order.column}.${this.state.order.ascending ? "asc" : "desc"}`);
    if (this.state.limit !== undefined) params.set("limit", String(this.state.limit));
    if (this.state.onConflict) params.set("on_conflict", this.state.onConflict);

    const path = `${url}/rest/v1/${this.state.table}${params.toString() ? `?${params}` : ""}`;
    const headers = new Headers({ apikey: anonKey, "Content-Type": "application/json", Prefer: "return=representation" });
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const init: RequestInit = { method: this.state.operation === "select" ? "GET" : this.state.operation === "insert" ? "POST" : this.state.operation === "upsert" ? "POST" : "PATCH", headers, cache: "no-store" };
    if (this.state.operation !== "select") init.body = JSON.stringify(this.state.payload);

    try {
      const response = await fetch(path, init);
      const text = await response.text();
      let data: unknown = null;
      if (text) {
        try { data = JSON.parse(text); } catch { data = text; }
      }
      if (!response.ok) return { data: null, error: { message: typeof data === "string" ? data : JSON.stringify(data) } };

      const rows = Array.isArray(data) ? data : data == null ? [] : [data];
      if (this.singleMode === "single") {
        if (rows.length !== 1) return { data: null, error: { message: `Expected exactly one row, received ${rows.length}.` } };
        return { data: rows[0] as T, error: null };
      }
      if (this.singleMode === "maybeSingle") {
        if (rows.length > 1) return { data: null, error: { message: `Expected zero or one row, received ${rows.length}.` } };
        return { data: (rows[0] ?? null) as T | null, error: null };
      }
      return { data: (this.state.operation === "select" ? rows : rows) as T[], error: null };
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : "Supabase request failed." } };
    }
  }
}

export async function createSupabaseServerClient() {
  const { url, anonKey } = getConfig();
  const token = await getAccessToken();
  const request = async (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set("apikey", anonKey);
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${url}${path}`, { ...init, headers, cache: "no-store" });
  };

  return {
    auth: {
      async getUser() {
        if (!token) return { data: { user: null }, error: null };
        const response = await request("/auth/v1/user");
        if (!response.ok) return { data: { user: null }, error: { message: await response.text() } };
        return { data: { user: await response.json() }, error: null };
      },
    },
    from<T = Record<string, unknown>>(table: string) {
      return new QueryBuilder<T>(table);
    },
    async rpc<T = unknown>(functionName: string, args: Record<string, unknown> = {}) {
      const response = await request(`/rest/v1/rpc/${functionName}`, { method: "POST", body: JSON.stringify(args) });
      if (!response.ok) return { data: null as T | null, error: { message: await response.text() } };
      const text = await response.text();
      let data: unknown = null;
      if (text) { try { data = JSON.parse(text); } catch { data = text; } }
      return { data: data as T, error: null };
    },
  };
}

export async function supabaseRequest<T>(path: string, init: RequestInit = {}, accessToken?: string): Promise<T> {
  const { url, anonKey } = getConfig();
  const headers = new Headers(init.headers);
  headers.set("apikey", anonKey);
  headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers, cache: "no-store" });
  if (!response.ok) throw new Error(`SUPABASE_REQUEST_FAILED:${response.status}:${await response.text()}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
