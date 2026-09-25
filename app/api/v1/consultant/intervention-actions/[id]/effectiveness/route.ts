import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { getPortfolioPredictiveIntelligence } from "@/lib/consulting/portfolio-predictive-intelligence";
import { calculateInterventionEffectiveness } from "@/lib/consulting/intervention-actions";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const context = await getOrganizationContext();
    const supabase = await createSupabaseServerClient();
    const { data: action, error } = await supabase.from("intervention_actions").select("*").eq("id", id).eq("organization_id", context.organizationId).single();
    if (error) throw error;

    const portfolio = await getPortfolioPredictiveIntelligence();
    const project = portfolio.projects.find((item) => item.id === action.project_id);
    if (!project) return NextResponse.json({ error: "PROJECT_NOT_FOUND" }, { status: 404 });

    const effectiveness = calculateInterventionEffectiveness({
      baselineRiskScore: action.baseline_risk_score,
      currentRiskScore: project.predictiveRiskScore,
      baselineDeliveryHealth: action.baseline_delivery_health,
      currentDeliveryHealth: project.deliveryHealth,
      baselineOutcomeHealth: action.baseline_outcome_health,
      currentOutcomeHealth: project.outcomeHealth,
    });

    return NextResponse.json({
      action: { id: action.id, title: action.title, status: action.status, completedAt: action.completed_at },
      baseline: { riskScore: action.baseline_risk_score, deliveryHealth: action.baseline_delivery_health, outcomeHealth: action.baseline_outcome_health },
      current: { riskScore: project.predictiveRiskScore, deliveryHealth: project.deliveryHealth, outcomeHealth: project.outcomeHealth },
      effectiveness,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "INTERVENTION_EFFECTIVENESS_READ_FAILED" }, { status: 400 });
  }
}