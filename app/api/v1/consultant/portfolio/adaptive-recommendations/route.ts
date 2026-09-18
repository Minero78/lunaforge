import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { getPortfolioPredictiveIntelligence } from "@/lib/consulting/portfolio-predictive-intelligence";
import { buildPlaybookPerformance } from "@/lib/consulting/intervention-learning";
import { getAdaptiveRecommendation } from "@/lib/consulting/adaptive-recommendations";

export async function GET() {
  try {
    const context=await getOrganizationContext();
    const supabase=await createSupabaseServerClient();
    const [{data},portfolio]=await Promise.all([
      supabase.from("intervention_actions").select("project_id,title,urgency,baseline_risk_score,status").eq("organization_id",context.organizationId).eq("status","COMPLETED"),
      getPortfolioPredictiveIntelligence(),
    ]);
    const performance=buildPlaybookPerformance((data??[]).map(action=>({title:action.title,urgency:action.urgency,baselineRiskScore:action.baseline_risk_score,currentRiskScore:portfolio.projects.find(p=>p.id===action.project_id)?.predictiveRiskScore??null})));
    return NextResponse.json({projects:portfolio.projects.map(project=>({id:project.id,name:project.name,priority:project.interventionPriority,recommendation:getAdaptiveRecommendation(project.recommendedActions[0]?.title??"Increase monitoring cadence",performance)}))});
  } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"ADAPTIVE_RECOMMENDATIONS_READ_FAILED"},{status:400}); }
}