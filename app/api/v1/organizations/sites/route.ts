import { jsonError } from "@/lib/api/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const context = await getOrganizationContext();
  const { data, error } = await supabase.from("sites").select("id, name, code, location, created_at, updated_at").eq("organization_id", context.organizationId).order("name");
  if (error) return jsonError("Unable to load sites.", 500, "SITES_READ_FAILED");
  return Response.json({ sites: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const context = await getOrganizationContext();
  if (context.role === "MEMBER") return jsonError("Administrator permission required.", 403, "ADMIN_REQUIRED");

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Request body must be valid JSON.", 400, "INVALID_JSON"); }
  if (!body || typeof body !== "object" || typeof (body as { name?: unknown }).name !== "string") return jsonError("Site name is required.", 400, "SITE_NAME_REQUIRED");
  const name = (body as { name: string }).name.trim();
  if (!name) return jsonError("Site name is required.", 400, "SITE_NAME_REQUIRED");

  const input = body as { name: string; code?: unknown; location?: unknown };
  const { data, error } = await supabase.from("sites").insert({ organization_id: context.organizationId, name, code: typeof input.code === "string" ? input.code.trim() || null : null, location: typeof input.location === "string" ? input.location.trim() || null : null }).select("id, name, code, location, created_at, updated_at").single();
  if (error) return jsonError("Unable to create site.", 500, "SITE_CREATE_FAILED");
  return Response.json({ site: data }, { status: 201 });
}
