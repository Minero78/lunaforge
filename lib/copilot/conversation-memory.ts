export type ConversationTurn={role:"user"|"assistant";content:string;createdAt:string};
export function appendConversationTurn(history:ConversationTurn[],turn:Omit<ConversationTurn,"createdAt">){return [...history,{...turn,createdAt:new Date().toISOString()}].slice(-12);}
export function buildConversationContext(history:ConversationTurn[]){return history.map(t=>t.role+": "+t.content).join("\n");}