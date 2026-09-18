import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { getPortfolioPredictiveIntelligence } from "@/lib/consulting/portfolio-predictive-intelligence";
import { buildPlaybookPerformance } from "@/lib/consulting/intervention-learning";

export async function GET() {
  try {
    const context = await getOrganizationContext();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("intervention_actions").select("project_id,title,urgency,baseline_risk_score,status").eq("organization_id", context.organizationId).eq("status", "COMPLETED");
    if (error) throw error;
    const portfolio = await getPortfolioPredictiveIntelligence();
    const records = (data ?? []).map((action) => {
      const project = portfolio.projects.find((item) => item.id === action.project_id);
      return { title: action.title, urgency: action.urgency, baselineRiskScore: action.baseline_risk_score, currentRiskScore: project?.predictiveRiskScore ?? null };
    });
    return NextResponse.json({ playbooks: buildPlaybookPerformance(records) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "PLAYBOOK_PERFORMANCE_READ_FAILED" }, { status: 400 });
  }
}