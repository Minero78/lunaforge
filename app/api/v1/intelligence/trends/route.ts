import { jsonError } from "../../../../../../lib/api/errors";
import { buildDimensionTrends, buildIntelligenceTrend, type AssessmentSnapshot } from "../../../../../../lib/intelligence/history";
import { createSupabaseServerClient } from "../../../../../../lib/supabase/server";
import { getOrganizationContext } from "../../../../../../lib/supabase/auth-context";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const context = await getOrganizationContext(supabase);
  if (!context) return jsonError("Organization context required.", 401, "ORGANIZATION_CONTEXT_REQUIRED");

  const { data, error } = await supabase
    .from("assessment_results")
    .select("assessment_id, overall_score, maturity, dimension_scores, calculated_at, assessments!inner(organization_id, site_id)")
    .eq("assessments.organization_id", context.organizationId)
    .order("calculated_at", { ascending: true });

  if (error) return jsonError("Unable to load intelligence history.", 500, "INTELLIGENCE_HISTORY_FAILED");

  const history: AssessmentSnapshot[] = (data ?? []).map((row) => ({
    id: row.assessment_id,
    siteId: row.assessments.site_id ?? undefined,
    completedAt: row.calculated_at,
    overallScore: Number(row.overall_score),
    maturity: row.maturity,
    dimensionScores: row.dimension_scores,
  }));

  return Response.json({ trend: buildIntelligenceTrend(history), dimensions: buildDimensionTrends(history), history });
}
