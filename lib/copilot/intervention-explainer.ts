export function explainInterventions(project:any){
 const actions=project.recommendedActions??[];
 if(!actions.length)return "No intervention is currently recommended.";
 return actions.map((a:any,i:number)=>(i+1)+". "+a.title+" — "+a.description+" Owner: "+a.owner+". Urgency: "+a.urgency+".").join("\n");
}