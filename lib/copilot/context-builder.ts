export type CopilotContext = { scope:string; generatedAt:string; portfolio:unknown; executiveSummary:unknown };
export function buildCopilotContext(input:{portfolio:unknown;executiveSummary:unknown;scope?:string}):CopilotContext{
 return {scope:input.scope??"PORTFOLIO",generatedAt:new Date().toISOString(),portfolio:input.portfolio,executiveSummary:input.executiveSummary};
}