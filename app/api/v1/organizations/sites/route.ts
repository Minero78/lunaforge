import { jsonError } from "@/lib/api/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

type SiteRow = {
  id: string;
  name: string;
  code: string | null;
  location: string | null;
  country: string | null;
  commodity: string | null;
  created_at: string;
  updated_at: string;
};

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const context = await getOrganizationContext();
    const { data, error } = await supabase
      .from<SiteRow>("sites")
      .select("id, name, code, location, country, commodity, created_at, updated_at")
      .eq("organization_id", context.organizationId)
      .order("name");
    if (error) return jsonError("Unable to load sites.", 500, "SITES_READ_FAILED");
    return Response.json({ sites: data ?? [] });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    return jsonError("Unable to load sites.", 500, "SITES_READ_FAILED");
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const context = await getOrganizationContext();
    if (context.role === "MEMBER") return jsonError("Administrator permission required.", 403, "ADMIN_REQUIRED");

    let body: unknown;
    try { body = await request.json(); } catch { return jsonError("Request body must be valid JSON.", 400, "INVALID_JSON"); }
    if (!body || typeof body !== "object" || typeof (body as { name?: unknown }).name !== "string") return jsonError("Site name is required.", 400, "SITE_NAME_REQUIRED");

    const input = body as { name: string; code?: unknown; location?: unknown; country?: unknown; commodity?: unknown };
    const name = input.name.trim();
    if (!name) return jsonError("Site name is required.", 400, "SITE_NAME_REQUIRED");

    const country = typeof input.country === "string" ? input.country.trim() || null : null;
    const commodity = typeof input.commodity === "string" ? input.commodity.trim() || null : null;
    const code = typeof input.code === "string" ? input.code.trim() || null : null;
    const location = typeof input.location === "string" ? input.location.trim() || null : null;

    const { data, error } = await supabase
      .from<SiteRow>("sites")
      .insert({ organization_id: context.organizationId, name, code, location, country, commodity })
      .select("id, name, code, location, country, commodity, created_at, updated_at")
      .single();
    if (error) return jsonError("Unable to create site.", 500, "SITE_CREATE_FAILED");
    return Response.json({ site: data }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    return jsonError("Unable to create site.", 500, "SITE_CREATE_FAILED");
  }
}
