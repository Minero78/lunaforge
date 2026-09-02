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
  return (data ?? []).map((row) => ({
    id: String(row.id), organizationId: String(row.organization_id), assessmentId: String(row.assessment_id),
    dimension: String(row.dimension), title: String(row.title), rationale: String(row.rationale),
    suggestedService: String(row.suggested_service), priority: row.priority as CommercialOpportunity["priority"],
    impact: row.impact as CommercialOpportunity["impact"], stage: row.stage as CommercialOpportunity["stage"],
    estimatedValue: row.estimated_value == null ? undefined : Number(row.estimated_value),
    currency: row.currency == null ? undefined : String(row.currency),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  }));
}
