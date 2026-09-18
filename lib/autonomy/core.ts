export type Agent = { id: string; name: string; capabilities: string[]; status?: string; trust?: number; reputation?: number };
export type Task = { id: string; goal: string; priority?: number; capability?: string };
export type Assignment = { taskId: string; agentId: string | null; agent: Agent | null; reason: string };

export function orchestrateAgents(agents: Agent[], tasks: Task[]): Assignment[] {
  return tasks.map(task => {
    const eligible = agents.filter(agent => !task.capability || agent.capabilities.includes(task.capability));
    const agent = [...eligible].sort((a,b) => ((b.trust ?? 0) + (b.reputation ?? 0)) - ((a.trust ?? 0) + (a.reputation ?? 0)))[0] ?? null;
    return { taskId: task.id, agentId: agent?.id ?? null, agent, reason: agent ? "Capability and trust match" : "No eligible agent" };
  });
}
export function autonomousCommand(input: { agents: number; activeTasks: number; risk: number }) {
  const mode = input.risk >= 80 ? "HUMAN_CONTROL" : input.risk >= 60 ? "SUPERVISED" : input.activeTasks > 0 ? "AUTONOMOUS" : "STANDBY";
  return { mode, agents: input.agents, activeTasks: input.activeTasks, risk: input.risk };
}
export function agentAnalytics(input: { active: number; completed: number; failed: number }) {
  const total = input.completed + input.failed;
  return { active: input.active, completed: input.completed, failed: input.failed, successRate: total ? input.completed / total : 0 };
}
export function autonomyMetrics(input: { decisions: number; autonomous: number; interventions: number }) {
  return { decisions: input.decisions, autonomousDecisions: input.autonomous, interventions: input.interventions, autonomyRate: input.decisions ? input.autonomous / input.decisions : 0 };
}
export function autonomousExecutiveBrief(input: { status: string; risk: number; actions: number }) {
  return { headline: `Autonomous operating mode: ${input.status}`, recommendation: input.risk >= 80 ? "Escalate decisions for human approval." : input.actions ? "Continue monitored execution and review exceptions." : "No active autonomous actions." };
}