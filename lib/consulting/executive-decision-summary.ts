export function buildExecutiveDecisionSummary(input:{critical:number;high:number;deteriorating:number;topProject:string|null;topScore:number|null}) {
 const headline=input.critical>0?"Immediate executive intervention required":input.high>0?"Portfolio intervention priority elevated":"Portfolio intervention exposure controlled";
 const narrative=input.topProject?input.topProject+" is currently the highest intervention priority with a score of "+(input.topScore??"—")+"/100.":"No project currently requires elevated intervention.";
 return {headline,narrative,focus:{critical:input.critical,high:input.high,deteriorating:input.deteriorating}};
}