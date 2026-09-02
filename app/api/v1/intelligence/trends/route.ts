import { jsonError } from "@/lib/api/errors";
import { buildDimensionTrends, buildIntelligenceTrend, type AssessmentSnapshot } from "@/lib/intelligence/history";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

type AssessmentResultRow = {
  assessment_id: string;
  overall_score: number | string;
  maturity: string;
  dimension_scores: AssessmentSnapshot["dimensionScores"];
  calculated_at: string;
  assessments: Array<{ organization_id: string; site_id: string | null }>;
};

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const context = await getOrganizationContext();

    const { data, error } = await supabase
      .from("assessment_results")
      .select("assessment_id, overall_score, maturity, dimension_scores, calculated_at, assessments!inner(organization_id, site_id)")
      .eq("assessments.organization_id", context.organizationId)
      .order("calculated_at", { ascending: true });

    if (error) return jsonError("Unable to load intelligence history.", 500, "INTELLIGENCE_HISTORY_FAILED");

    const history: AssessmentSnapshot[] = ((data ?? []) as unknown as AssessmentResultRow[]).map((row) => {
      const assessment = row.assessments[0];
      return {
        id: row.assessment_id,
        siteId: assessment?.site_id ?? undefined,
        completedAt: row.calculated_at,
        overallScore: Number(row.overall_score),
        maturity: row.maturity,
        dimensionScores: row.dimension_scores,
      };
    });

    return Response.json({ trend: buildIntelligenceTrend(history), dimensions: buildDimensionTrends(history), history });
  } catch (error) {
    const code = error instanceof Error ? error.message : "INTELLIGENCE_HISTORY_FAILED";
    if (code === "AUTHENTICATION_REQUIRED") return jsonError("Authentication required.", 401, code);
    if (code === "ORGANIZATION_CONTEXT_REQUIRED") return jsonError("Organization context required.", 401, code);
    return jsonError("Unable to load intelligence history.", 500, "INTELLIGENCE_HISTORY_FAILED");
  }
}
