import {routeCopilotQuestion} from "./question-router";
import {explainProjectRisk} from "./risk-explainer";
import {explainInterventions} from "./intervention-explainer";
import {buildDailyBrief} from "./daily-brief";

export function generateCopilotResponse(question:string,portfolio:any){
 const intent=routeCopilotQuestion(question); const projects=portfolio.projects??[]; const top=projects[0];
 if(intent==="PRIORITIES") return {intent,answer:top?"Your highest priority is "+top.name+" with intervention priority "+top.interventionPriorityScore+"/100.":"No projects available."};
 if(intent==="RISK") return {intent,answer:top?explainProjectRisk(top):"No portfolio risk data is available."};
 if(intent==="INTERVENTION") return {intent,answer:top?explainInterventions(top):"No intervention data is available."};
 if(intent==="EXPLAIN") return {intent,answer:top?explainProjectRisk(top):"No project is available for explanation."};
 if(intent==="BRIEF") return {intent,answer:buildDailyBrief(portfolio)};
 if(intent==="PROJECT") return {intent,answer:projects.map((p:any)=>({name:p.name,risk:p.predictiveRiskScore,trend:p.trend,priority:p.interventionPriority})).slice(0,10)};
 return {intent,answer:"I can help prioritize portfolio risks, explain deterioration, recommend interventions, and generate executive briefs."};
}