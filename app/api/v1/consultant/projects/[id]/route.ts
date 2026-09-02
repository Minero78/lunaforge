import { jsonError } from "@/lib/api/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

const statuses = new Set(["PLANNED", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json() as { status?: unknown; startDate?: unknown; targetEndDate?: unknown; completedAt?: unknown };
    const context = await getOrganizationContext();
    if (context.role !== "OWNER" && context.role !== "ADMIN") throw new Error("ORGANIZATION_ADMIN_REQUIRED");

    if (body.status !== undefined && (typeof body.status !== "string" || !statuses.has(body.status.toUpperCase()))) {
      return jsonError("Invalid project status.", 400, "INVALID_PROJECT_STATUS");
    }

    const supabase = await createSupabaseServerClient();
    const current = await supabase.from<Record<string, unknown>>("consulting_projects")
      .select("id, organization_id, status, start_date, target_end_date")
      .eq("id", id).eq("organization_id", context.organizationId).maybeSingle();
    if (current.error) throw new Error(`PROJECT_READ_FAILED:${current.error.message}`);
    if (!current.data) return jsonError("Project not found.", 404, "PROJECT_NOT_FOUND");

    const payload: Record<string, unknown> = {};
    if (body.status !== undefined) payload.status = String(body.status).toUpperCase();
    if (body.startDate !== undefined) payload.start_date = body.startDate;
    if (body.targetEndDate !== undefined) payload.target_end_date = body.targetEndDate;
    if (body.completedAt !== undefined) payload.completed_at = body.completedAt;
    if (Object.keys(payload).length === 0) return jsonError("No changes supplied.", 400, "NO_PROJECT_CHANGES");

    const startDate = payload.start_date ?? current.data.start_date;
    const endDate = payload.target_end_date ?? current.data.target_end_date;
    if (startDate && endDate && String(endDate) < String(startDate)) return jsonError("targetEndDate cannot precede startDate.", 400, "PROJECT_END_BEFORE_START");

    const updated = await supabase.from<Record<string, unknown>>("consulting_projects")
      .update(payload).eq("id", id).eq("organization_id", context.organizationId)
      .select("id, organization_id, opportunity_id, name, status, start_date, target_end_date, completed_at, contract_value, currency, created_at, updated_at")
      .single();
    if (updated.error) throw new Error(`PROJECT_UPDATE_FAILED:${updated.error.message}`);
    return Response.json({ project: updated.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTHENTICATION_REQUIRED") return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    if (message === "ORGANIZATION_ADMIN_REQUIRED") return jsonError("Organization admin access is required.", 403, "ORGANIZATION_ADMIN_REQUIRED");
    return jsonError("Unable to update consulting project.", 500, "PROJECT_UPDATE_FAILED");
  }
}
