export type AlertStatus="OPEN"|"ACKNOWLEDGED"|"IN_PROGRESS"|"RESOLVED";
const transitions:Record<AlertStatus,AlertStatus[]>={OPEN:["ACKNOWLEDGED","IN_PROGRESS","RESOLVED"],ACKNOWLEDGED:["IN_PROGRESS","RESOLVED"],IN_PROGRESS:["RESOLVED"],RESOLVED:[]};
export function canTransitionAlert(from:AlertStatus,to:AlertStatus){return transitions[from]?.includes(to)??false;}