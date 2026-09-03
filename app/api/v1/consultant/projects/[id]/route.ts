import { jsonError } from "@/lib/api/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

const statuses = new Set(["PLANNED", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]);
const transitions: Record<string, Set<string>> = {
  PLANNED: new Set(["PLANNED", "ACTIVE", "CANCELLED"]),
  ACTIVE: new Set(["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]),
  ON_HOLD: new Set(["ON_HOLD", "ACTIVE", "CANCELLED"]),
  COMPLETED: new Set(["COMPLETED"]),
  CANCELLED: new Set(["CANCELLED"]),
};

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const projectColumns = "id, organization_id, opportunity_id, name, status, start_date, target_end_date, completed_at, contract_value, currency, created_at, updated_at";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const context = await getOrganizationContext();
    const supabase = await createSupabaseServerClient();
    const result = await supabase.from<Record<string, unknown>>("consulting_projects")
      .select(projectColumns).eq("id", id).eq("organization_id", context.organizationId).maybeSingle();
    if (result.error) throw new Error(`PROJECT_READ_FAILED:${result.error.message}`);
    if (!result.data) return jsonError("Project not found.", 404, "PROJECT_NOT_FOUND");
    return Response.json({ project: result.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTHENTICATION_REQUIRED") return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    if (message === "ORGANIZATION_CONTEXT_REQUIRED") return jsonError("Organization context is required.", 403, "ORGANIZATION_CONTEXT_REQUIRED");
    return jsonError("Unable to load consulting project.", 500, "PROJECT_READ_FAILED");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json() as {
      status?: unknown;
      startDate?: unknown;
      targetEndDate?: unknown;
      completedAt?: unknown;
    };
    const context = await getOrganizationContext();
    if (context.role !== "OWNER" && context.role !== "ADMIN") throw new Error("ORGANIZATION_ADMIN_REQUIRED");

    if (body.status !== undefined && (typeof body.status !== "string" || !statuses.has(body.status.toUpperCase()))) {
      return jsonError("Invalid project status.", 400, "INVALID_PROJECT_STATUS");
    }
    for (const [field, value] of [["startDate", body.startDate], ["targetEndDate", body.targetEndDate]] as const) {
      if (value !== undefined && value !== null && (typeof value !== "string" || !isoDate.test(value))) {
        return jsonError(`${field} must use YYYY-MM-DD format or null.`, 400, "INVALID_PROJECT_DATE");
      }
    }
    if (body.completedAt !== undefined && body.completedAt !== null &&
      (typeof body.completedAt !== "string" || Number.isNaN(Date.parse(body.completedAt)))) {
      return jsonError("completedAt must be a valid timestamp or null.", 400, "INVALID_COMPLETED_AT");
    }

    const supabase = await createSupabaseServerClient();
    const current = await supabase.from<Record<string, unknown>>("consulting_projects")
      .select("id, organization_id, status, start_date, target_end_date, completed_at")
      .eq("id", id).eq("organization_id", context.organizationId).maybeSingle();
    if (current.error) throw new Error(`PROJECT_READ_FAILED:${current.error.message}`);
    if (!current.data) return jsonError("Project not found.", 404, "PROJECT_NOT_FOUND");

    const currentStatus = String(current.data.status);
    const nextStatus = body.status === undefined ? currentStatus : body.status.toUpperCase();
    if (!transitions[currentStatus]?.has(nextStatus)) {
      return jsonError(`Invalid project status transition: ${currentStatus} -> ${nextStatus}.`, 409, "INVALID_PROJECT_STATUS_TRANSITION");
    }

    const payload: Record<string, unknown> = {};
    if (body.status !== undefined) payload.status = nextStatus;
    if (body.startDate !== undefined) payload.start_date = body.startDate;
    if (body.targetEndDate !== undefined) payload.target_end_date = body.targetEndDate;
    if (body.completedAt !== undefined) payload.completed_at = body.completedAt;
    if (Object.keys(payload).length === 0) return jsonError("No changes supplied.", 400, "NO_PROJECT_CHANGES");

    const startDate = payload.start_date ?? current.data.start_date;
    const endDate = payload.target_end_date ?? current.data.target_end_date;
    if (startDate && endDate && String(endDate) < String(startDate)) {
      return jsonError("targetEndDate cannot precede startDate.", 400, "PROJECT_END_BEFORE_START");
    }
    if (nextStatus === "COMPLETED" && payload.completed_at === null) {
      return jsonError("completedAt cannot be null when completing a project.", 400, "COMPLETED_AT_REQUIRED");
    }
    if (nextStatus === "COMPLETED" && payload.completed_at === undefined && current.data.completed_at == null) {
      payload.completed_at = new Date().toISOString();
    }
    if (nextStatus !== "COMPLETED" && payload.completed_at !== undefined && payload.completed_at !== null) {
      return jsonError("completedAt requires COMPLETED status.", 400, "COMPLETED_AT_REQUIRES_COMPLETED_STATUS");
    }

    const updated = await supabase.from<Record<string, unknown>>("consulting_projects")
      .update(payload).eq("id", id).eq("organization_id", context.organizationId)
      .select(projectColumns).single();
    if (updated.error) throw new Error(`PROJECT_UPDATE_FAILED:${updated.error.message}`);
    return Response.json({ project: updated.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTHENTICATION_REQUIRED") return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    if (message === "ORGANIZATION_ADMIN_REQUIRED") return jsonError("Organization admin access is required.", 403, "ORGANIZATION_ADMIN_REQUIRED");
    return jsonError("Unable to update consulting project.", 500, "PROJECT_UPDATE_FAILED");
  }
}
