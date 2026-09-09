import {NextRequest,NextResponse} from "next/server";
import {getPortfolioPredictiveIntelligence} from "@/lib/consulting/portfolio-predictive-intelligence";
import {buildExecutiveDecisionSummary} from "@/lib/consulting/executive-decision-summary";
import {buildCopilotContext} from "@/lib/copilot/context-builder";
import {buildPortfolioContext} from "@/lib/copilot/portfolio-context";
import {generateCopilotResponse} from "@/lib/copilot/response-engine";

export async function POST(request:NextRequest){
 try{
  const {question}=await request.json();
  if(typeof question!=="string"||!question.trim())return NextResponse.json({error:"QUESTION_REQUIRED"},{status:400});
  const portfolio=await getPortfolioPredictiveIntelligence();
  const top=portfolio.projects[0]??null;
  const executiveSummary=buildExecutiveDecisionSummary({critical:portfolio.summary.criticalInterventions,high:portfolio.summary.highInterventions,deteriorating:portfolio.summary.deteriorating,topProject:top?.name??null,topScore:top?.interventionPriorityScore??null});
  const context=buildCopilotContext({portfolio:buildPortfolioContext(portfolio),executiveSummary});
  return NextResponse.json({response:generateCopilotResponse(question,portfolio),context:{scope:context.scope,generatedAt:context.generatedAt}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"COPILOT_REQUEST_FAILED"},{status:400});}
}