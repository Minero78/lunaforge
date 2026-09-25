import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

export type ConsultingProject = {
  id: string;
  organizationId: string;
  opportunityId: string;
  name: string;
  status: "PLANNED" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  startDate?: string;
  targetEndDate?: string;
  completedAt?: string;
  contractValue?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
};

const columns = "id, organization_id, opportunity_id, name, status, start_date, target_end_date, completed_at, contract_value, currency, created_at, updated_at";

export async function createProjectFromWonOpportunity(input: {
  opportunityId: string;
  name: string;
  startDate?: string | null;
  targetEndDate?: string | null;
  contractValue?: number | null;
  currency?: string | null;
}): Promise<ConsultingProject> {
  const context = await getOrganizationContext();
  if (context.role !== "OWNER" && context.role !== "ADMIN") throw new Error("ORGANIZATION_ADMIN_REQUIRED");
  if (!input.name.trim()) throw new Error("PROJECT_NAME_REQUIRED");

  const supabase = await createSupabaseServerClient();
  const opportunity = await supabase
    .from<Record<string, unknown>>("consulting_opportunities")
    .select("id, stage, estimated_value, currency")
    .eq("id", input.opportunityId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (opportunity.error) throw new Error(`OPPORTUNITY_READ_FAILED:${opportunity.error.message}`);
  if (!opportunity.data) throw new Error("CONSULTING_OPPORTUNITY_NOT_FOUND");
  if (opportunity.data.stage !== "WON") throw new Error("PROJECT_REQUIRES_WON_OPPORTUNITY");

  const project = await supabase
    .from<Record<string, unknown>>("consulting_projects")
    .insert({
      organization_id: context.organizationId,
      opportunity_id: input.opportunityId,
      name: input.name.trim(),
      status: "PLANNED",
      start_date: input.startDate ?? null,
      target_end_date: input.targetEndDate ?? null,
      contract_value: input.contractValue ?? opportunity.data.estimated_value ?? null,
      currency: input.currency?.toUpperCase() ?? (opportunity.data.currency == null ? null : String(opportunity.data.currency)),
    })
    .select(columns)
    .single();
  if (project.error) throw new Error(`PROJECT_CREATE_FAILED:${project.error.message}`);
  return mapProject(project.data as Record<string, unknown>);
}

export async function listConsultingProjects(): Promise<ConsultingProject[]> {
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from<Record<string, unknown>>("consulting_projects")
    .select(columns)
    .eq("organization_id", context.organizationId)
    .order("updated_at", { ascending: false });
  if (result.error) throw new Error(`PROJECT_READ_FAILED:${result.error.message}`);
  return (result.data ?? []).map(mapProject);
}

function mapProject(row: Record<string, unknown>): ConsultingProject {
  return {
    id: String(row.id), organizationId: String(row.organization_id), opportunityId: String(row.opportunity_id),
    name: String(row.name), status: row.status as ConsultingProject["status"],
    startDate: row.start_date == null ? undefined : String(row.start_date),
    targetEndDate: row.target_end_date == null ? undefined : String(row.target_end_date),
    completedAt: row.completed_at == null ? undefined : String(row.completed_at),
    contractValue: row.contract_value == null ? undefined : Number(row.contract_value),
    currency: row.currency == null ? undefined : String(row.currency),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}
