import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { getPortfolioPredictiveIntelligence } from "@/lib/consulting/portfolio-predictive-intelligence";

export async function GET() {
  try {
    const context = await getOrganizationContext();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("intervention_actions").select("project_id, title, urgency, baseline_risk_score, status").eq("organization_id", context.organizationId).eq("status", "COMPLETED");
    if (error) throw error;

    const portfolio = await getPortfolioPredictiveIntelligence();
    const completed = data ?? [];
    const insights = completed.map((action) => {
      const project = portfolio.projects.find((item) => item.id === action.project_id);
      const currentRisk = project?.predictiveRiskScore ?? null;
      const delta = action.baseline_risk_score === null || currentRisk === null ? null : action.baseline_risk_score - currentRisk;
      return { ...action, currentRiskScore: currentRisk, riskDelta: delta, improved: delta !== null && delta > 0 };
    });

    const measurable = insights.filter((item) => item.riskDelta !== null);
    return NextResponse.json({
      summary: {
        completedActions: completed.length,
        measurableActions: measurable.length,
        improvedActions: measurable.filter((item) => item.improved).length,
        averageRiskReduction: measurable.length ? Math.round(measurable.reduce((sum,item)=>sum+(item.riskDelta ?? 0),0)/measurable.length) : null,
      },
      insights,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "INTERVENTION_LEARNING_READ_FAILED" }, { status: 400 });
  }
}