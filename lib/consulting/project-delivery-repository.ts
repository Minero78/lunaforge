import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

export type DeliveryMilestone = {
  id: string;
  projectId: string;
  name: string;
  dueDate?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "DONE";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
};

export type DeliveryRisk = {
  id: string;
  projectId: string;
  title: string;
  owner?: string;
  mitigation?: string;
  level: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "MITIGATING" | "CLOSED";
};

export async function listProjectDelivery(projectId: string): Promise<{ milestones: DeliveryMilestone[]; risks: DeliveryRisk[] }> {
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();
  const [milestonesResult, risksResult] = await Promise.all([
    supabase.from<Record<string, unknown>>("project_milestones").select("id, project_id, name, due_date, status, risk_level").eq("organization_id", context.organizationId).eq("project_id", projectId).order("due_date", { ascending: true }),
    supabase.from<Record<string, unknown>>("project_risks").select("id, project_id, title, owner, mitigation, level, status").eq("organization_id", context.organizationId).eq("project_id", projectId).order("created_at", { ascending: false }),
  ]);
  if (milestonesResult.error) throw new Error(`PROJECT_MILESTONES_READ_FAILED:${milestonesResult.error.message}`);
  if (risksResult.error) throw new Error(`PROJECT_RISKS_READ_FAILED:${risksResult.error.message}`);
  return {
    milestones: ((milestonesResult.data ?? []) as Record<string, unknown>[]).map(mapMilestone),
    risks: ((risksResult.data ?? []) as Record<string, unknown>[]).map(mapRisk),
  };
}

function mapMilestone(row: Record<string, unknown>): DeliveryMilestone {
  return { id: String(row.id), projectId: String(row.project_id), name: String(row.name), dueDate: row.due_date == null ? undefined : String(row.due_date), status: row.status as DeliveryMilestone["status"], riskLevel: row.risk_level as DeliveryMilestone["riskLevel"] };
}

function mapRisk(row: Record<string, unknown>): DeliveryRisk {
  return { id: String(row.id), projectId: String(row.project_id), title: String(row.title), owner: row.owner == null ? undefined : String(row.owner), mitigation: row.mitigation == null ? undefined : String(row.mitigation), level: row.level as DeliveryRisk["level"], status: row.status as DeliveryRisk["status"] };
}