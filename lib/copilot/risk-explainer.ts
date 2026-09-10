export function explainProjectRisk(project:any){
 const signals=project.signals?.length?project.signals.join("; "):"No material warning signals";
 return {headline:project.name+" has a predictive risk score of "+project.predictiveRiskScore+"/100.",reason:"The current risk profile is driven by: "+signals,trend:"Trend: "+project.trend,priority:"Intervention priority: "+project.interventionPriority};
}