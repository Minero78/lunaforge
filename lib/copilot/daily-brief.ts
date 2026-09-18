export function buildDailyBrief(portfolio:any){
 const projects=portfolio.projects??[];
 const top=projects[0];
 return {headline:portfolio.summary?.criticalInterventions>0?"Critical intervention attention is required today.":"Portfolio is under active monitoring.",topPriority:top?{name:top.name,score:top.interventionPriorityScore,risk:top.predictiveRiskScore}:null,deteriorating:projects.filter((p:any)=>p.trend==="DETERIORATING").map((p:any)=>p.name),recommendedFocus:top?.recommendedActions?.slice(0,3).map((a:any)=>a.title)??[]};
}