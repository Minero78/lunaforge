import { jsonError } from "../../../../../lib/api/errors";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required.", 401, "AUTHENTICATION_REQUIRED");

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Request body must be valid JSON.", 400, "INVALID_JSON"); }
  if (!body || typeof body !== "object" || !("name" in body) || typeof (body as { name: unknown }).name !== "string") {
    return jsonError("Organization name is required.", 400, "ORGANIZATION_NAME_REQUIRED");
  }

  const name = (body as { name: string }).name.trim();
  if (!name) return jsonError("Organization name is required.", 400, "ORGANIZATION_NAME_REQUIRED");

  const { data, error } = await supabase.rpc("create_organization", { org_name: name });
  if (error) return jsonError("Unable to create organization.", 500, "ORGANIZATION_CREATE_ERROR");

  return Response.json({ id: data, name, role: "OWNER" }, { status: 201 });
}
