import { jsonError } from "@/lib/api/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required.", 401, "AUTHENTICATION_REQUIRED");

  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return jsonError("Unable to load organization context.", 500, "ORGANIZATION_LOOKUP_FAILED");
  if (!data) return jsonError("Organization context required.", 404, "ORGANIZATION_CONTEXT_REQUIRED");

  return Response.json({
    userId: user.id,
    organizationId: data.organization_id,
    role: data.role,
    organization: data.organizations,
  });
}
