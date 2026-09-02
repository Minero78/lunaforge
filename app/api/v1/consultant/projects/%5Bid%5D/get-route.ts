import { jsonError } from "@/lib/api/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

const columns = "id, organization_id, opportunity_id, name, status, start_date, target_end_date, completed_at, contract_value, currency, created_at, updated_at";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const context = await getOrganizationContext();
    const supabase = await createSupabaseServerClient();
    const result = await supabase.from<Record<string, unknown>>("consulting_projects")
      .select(columns)
      .eq("id", id)
      .eq("organization_id", context.organizationId)
      .maybeSingle();
    if (result.error) throw new Error(`PROJECT_READ_FAILED:${result.error.message}`);
    if (!result.data) return jsonError("Project not found.", 404, "PROJECT_NOT_FOUND");
    return Response.json({ project: result.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTHENTICATION_REQUIRED") return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    return jsonError("Unable to load consulting project.", 500, "PROJECT_READ_FAILED");
  }
}
