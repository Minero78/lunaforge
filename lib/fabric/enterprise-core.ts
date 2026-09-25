export function scoreSignalQuality(input:{completeness:number;freshness:number;consistency:number}){return (input.completeness+input.freshness+input.consistency)/3;}
export function detectAnomaly(values:number[],value:number){const avg=values.reduce((a,b)=>a+b,0)/(values.length||1);const variance=values.reduce((a,b)=>a+(b-avg)**2,0)/(values.length||1);const z=Math.abs(value-avg)/(Math.sqrt(variance)||1);return {anomaly:z>3,z};}
export function prioritizeEnterpriseAlerts<T extends {id:string;severity:number;impact:number;urgency:number}>(alerts:T[]){return [...alerts].map(a=>({...a,priority:a.severity*.45+a.impact*.3+a.urgency*.25})).sort((a,b)=>b.priority-a.priority);}
export function autonomyLevel(input:{confidence:number;risk:number}){return input.risk>=80?0:input.confidence>=95?4:input.confidence>=85?3:input.confidence>=70?2:1;}
export function requiresHumanReview(input:{risk:number;confidence:number}){return input.risk>=65||input.confidence<80;}
export function routeDecision(input:{risk:number;autonomy:number}){return input.risk>=80?'EXECUTIVE':input.autonomy>=3?'AUTONOMOUS':'MANAGER';}
export function capacityStatus(used:number,total:number){const utilization=total?used/total*100:0;return {utilization,status:utilization>=90?'CRITICAL':utilization>=75?'HIGH':'NORMAL'};}
export function earlyWarning(input:{risk:number;trend:number}){return {warning:input.risk>=60&&input.trend>0,severity:Math.min(100,input.risk+input.trend)};}
export function escalationLevel(score:number){return score>=90?'CEO':score>=75?'EXECUTIVE':score>=55?'DIRECTOR':'OPERATIONS';}
export function situationAwareness(signals:{severity:number}[]){const score=signals.length?signals.reduce((n,s)=>n+s.severity,0)/signals.length:0;return {score,state:score>=75?'CRITICAL':score>=50?'ELEVATED':'NORMAL'};}
export function maturityScore(input:{data:number;automation:number;governance:number;ai:number}){return (input.data+input.automation+input.governance+input.ai)/4;}
export function executiveSummary(input:{risk:number;priority:string;recommendations:string[]}){return {headline:`${input.priority} enterprise posture`,risk:input.risk,recommendations:input.recommendations.slice(0,5)};}
export function learningLoop(outcomes:{success:boolean}[]){return {samples:outcomes.length,successRate:outcomes.length?outcomes.filter(x=>x.success).length/outcomes.length:0};}