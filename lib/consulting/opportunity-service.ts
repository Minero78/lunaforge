import { assessmentRepository } from "@/lib/assessments/service";
import { deriveConsultingOpportunities } from "@/lib/intelligence/opportunities";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toCommercialOpportunity, type CommercialOpportunity } from "./opportunity";

const useSupabase = process.env.STRATOVA_PERSISTENCE === "supabase";

export async function syncConsultingOpportunities(assessmentId: string): Promise<CommercialOpportunity[]> {
  const assessment = await assessmentRepository.getAssessment(assessmentId);
  if (!assessment) throw new Error("ASSESSMENT_NOT_FOUND");
  if (assessment.status !== "SCORED" || !assessment.result) throw new Error("ASSESSMENT_NOT_SCORED");

  const derived = deriveConsultingOpportunities(assessment.result);

  if (!useSupabase) {
    return derived.map((item) => toCommercialOpportunity(item, assessment.id, "memory"));
  }

  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();
  const existing = await supabase
    .from<Record<string, unknown>>("consulting_opportunities")
    .select("id, dimension, stage, estimated_value, currency, created_at, updated_at")
    .eq("organization_id", context.organizationId)
    .eq("assessment_id", assessment.id);

  if (existing.error) throw new Error(`CONSULTING_OPPORTUNITIES_READ_FAILED:${existing.error.message}`);
  const existingByDimension = new Map(
    (existing.data ?? []).map((row) => [String(row.dimension), row]),
  );

  const payload = derived.map((item) => {
    const previous = existingByDimension.get(item.dimension);
    return {
      organization_id: context.organizationId,
      assessment_id: assessment.id,
      dimension: item.dimension,
      title: item.title,
      rationale: item.rationale,
      suggested_service: item.suggestedService,
      priority: item.priority,
      impact: item.impact,
      stage: previous?.stage ?? "IDENTIFIED",
      estimated_value: previous?.estimated_value ?? null,
      currency: previous?.currency ?? null,
    };
  });

  if (payload.length > 0) {
    const saved = await supabase
      .from<Record<string, unknown>>("consulting_opportunities")
      .upsert(payload, { onConflict: "organization_id,assessment_id,dimension" })
      .select("id, organization_id, assessment_id, dimension, title, rationale, suggested_service, priority, impact, stage, estimated_value, currency, created_at, updated_at");
    if (saved.error) throw new Error(`CONSULTING_OPPORTUNITIES_WRITE_FAILED:${saved.error.message}`);
  }

  return listPersistedConsultingOpportunities(assessment.id, context.organizationId);
}

async function listPersistedConsultingOpportunities(
  assessmentId: string,
  organizationId: string,
): Promise<CommercialOpportunity[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from<Record<string, unknown>>("consulting_opportunities")
    .select("id, organization_id, assessment_id, dimension, title, rationale, suggested_service, priority, impact, stage, estimated_value, currency, created_at, updated_at")
    .eq("organization_id", organizationId)
    .eq("assessment_id", assessmentId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`CONSULTING_OPPORTUNITIES_READ_FAILED:${error.message}`);

  return (data ?? []).map((row) => ({
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
  }));
}
