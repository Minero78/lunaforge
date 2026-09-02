import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import type { CommercialOpportunity } from "./opportunity";

export async function listConsultingOpportunities(assessmentId?: string): Promise<CommercialOpportunity[]> {
  const supabase = await createSupabaseServerClient();
  const context = await getOrganizationContext();
  let query = supabase
    .from<Record<string, unknown>>("consulting_opportunities")
    .select("id, organization_id, assessment_id, dimension, title, rationale, suggested_service, priority, impact, stage, estimated_value, currency, created_at, updated_at")
    .eq("organization_id", context.organizationId)
    .order("updated_at", { ascending: false });
  if (assessmentId) query = query.eq("assessment_id", assessmentId);
  const { data, error } = await query;
  if (error) throw new Error(`CONSULTING_OPPORTUNITIES_READ_FAILED:${error.message}`);
  return (data ?? []).map(mapOpportunity);
}

export async function updateConsultingOpportunity(
  id: string,
  patch: { stage?: CommercialOpportunity["stage"]; estimatedValue?: number | null; currency?: string | null },
): Promise<CommercialOpportunity> {
  const supabase = await createSupabaseServerClient();
  const context = await getOrganizationContext();
  if (context.role !== "OWNER" && context.role !== "ADMIN") throw new Error("ORGANIZATION_ADMIN_REQUIRED");

  const current = await supabase
    .from<Record<string, unknown>>("consulting_opportunities")
    .select("id, organization_id, assessment_id, dimension, title, rationale, suggested_service, priority, impact, stage, estimated_value, currency, created_at, updated_at")
    .eq("organization_id", context.organizationId)
    .eq("id", id)
    .maybeSingle();
  if (current.error) throw new Error(`CONSULTING_OPPORTUNITY_READ_FAILED:${current.error.message}`);
  if (!current.data) throw new Error("CONSULTING_OPPORTUNITY_NOT_FOUND");

  const currentStage = current.data.stage as CommercialOpportunity["stage"];
  if (patch.stage && !isValidStageTransition(currentStage, patch.stage)) throw new Error("INVALID_OPPORTUNITY_STAGE_TRANSITION");

  const payload: Record<string, unknown> = {};
  if (patch.stage) payload.stage = patch.stage;
  if (patch.estimatedValue !== undefined) payload.estimated_value = patch.estimatedValue;
  if (patch.currency !== undefined) payload.currency = patch.currency;
  if (Object.keys(payload).length === 0) throw new Error("NO_OPPORTUNITY_CHANGES");

  const updated = await supabase
    .from<Record<string, unknown>>("consulting_opportunities")
    .update(payload)
    .eq("organization_id", context.organizationId)
    .eq("id", id)
    .select("id, organization_id, assessment_id, dimension, title, rationale, suggested_service, priority, impact, stage, estimated_value, currency, created_at, updated_at")
    .single();
  if (updated.error) throw new Error(`CONSULTING_OPPORTUNITY_WRITE_FAILED:${updated.error.message}`);
  return mapOpportunity(updated.data as Record<string, unknown>);
}

function isValidStageTransition(from: CommercialOpportunity["stage"], to: CommercialOpportunity["stage"]): boolean {
  if (from === "WON" || from === "LOST") return false;
  const transitions: Record<Exclude<CommercialOpportunity["stage"], "WON" | "LOST">, CommercialOpportunity["stage"][]> = {
    IDENTIFIED: ["IDENTIFIED", "QUALIFIED"],
    QUALIFIED: ["QUALIFIED", "IDENTIFIED", "PROPOSED"],
    PROPOSED: ["PROPOSED", "QUALIFIED", "WON", "LOST"],
  };
  return transitions[from].includes(to);
}

function mapOpportunity(row: Record<string, unknown>): CommercialOpportunity {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    assessmentId: String(row.assessment_id),
    dimension: String(row.dimension),
    title: String(row.title),
    rationale: String(row.rationale),
    suggestedService: String(row.suggested_service),
    priority: row.priority as CommercialOpportunity["priority"],
    impact: row.impact as CommercialOpportunity["impact"],
    stage: row.stage as CommercialOpportunity["stage"],
    estimatedValue: row.estimated_value == null ? undefined : Number(row.estimated_value),
    currency: row.currency == null ? undefined : String(row.currency),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
