export function buildPortfolioContext(portfolio:any){
 return {summary:portfolio.summary,projects:portfolio.projects.map((p:any)=>({id:p.id,name:p.name,risk:p.predictiveRiskScore,priority:p.interventionPriorityScore,trend:p.trend,status:p.transformationStatus,signals:p.signals,actions:p.recommendedActions?.map((a:any)=>a.title)}))};
}