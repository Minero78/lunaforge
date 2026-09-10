import { NextResponse } from "next/server";
import { getPortfolioPredictiveIntelligence } from "@/lib/consulting/portfolio-predictive-intelligence";
import { buildExecutiveDecisionSummary } from "@/lib/consulting/executive-decision-summary";

export async function GET(){
 try{
  const portfolio=await getPortfolioPredictiveIntelligence();
  const top=portfolio.projects[0]??null;
  return NextResponse.json(buildExecutiveDecisionSummary({critical:portfolio.summary.criticalInterventions,high:portfolio.summary.highInterventions,deteriorating:portfolio.summary.deteriorating,topProject:top?.name??null,topScore:top?.interventionPriorityScore??null}));
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"EXECUTIVE_SUMMARY_READ_FAILED"},{status:400});}
}