export function buildProjectContext(portfolio:any,projectId:string){
 const project=portfolio.projects.find((p:any)=>p.id===projectId);
 if(!project) return null;
 return {id:project.id,name:project.name,deliveryHealth:project.deliveryHealth,outcomeHealth:project.outcomeHealth,transformationStatus:project.transformationStatus,predictiveRiskScore:project.predictiveRiskScore,trend:project.trend,signals:project.signals,recommendedActions:project.recommendedActions};
}