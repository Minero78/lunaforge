export type InterventionPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type InterventionInput = {
  transformationStatus: string;
  predictiveRiskScore: number;
  predictiveRiskLevel: string;
  trend: string;
  overdueMilestones: number;
  highOpenRisks: number;
};

export type RecommendedAction = {
  title: string;
  description: string;
  owner: "PROJECT_MANAGER" | "SPONSOR" | "EXECUTIVE";
  urgency: InterventionPriority;
};

export function calculateInterventionPriority(input: InterventionInput) {
  let score = input.predictiveRiskScore;
  if (input.transformationStatus === "EXECUTIVE_ESCALATION") score += 20;
  if (input.trend === "DETERIORATING") score += 10;
  score += Math.min(15, input.overdueMilestones * 3);
  score += Math.min(20, input.highOpenRisks * 5);
  score = Math.min(100, score);

  const priority: InterventionPriority =
    score >= 85 ? "CRITICAL" :
    score >= 65 ? "HIGH" :
    score >= 35 ? "MEDIUM" : "LOW";

  return { score, priority };
}

export function getRecommendedActions(input: InterventionInput): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  if (input.transformationStatus === "EXECUTIVE_ESCALATION") {
    actions.push({ title: "Initiate executive recovery review", description: "Bring delivery and value owners together to establish an immediate recovery plan.", owner: "EXECUTIVE", urgency: "CRITICAL" });
  }

  if (input.highOpenRisks > 0) {
    actions.push({ title: "Resolve critical risk exposure", description: "Assign accountable owners and time-bound mitigation actions for every high open risk.", owner: "SPONSOR", urgency: input.highOpenRisks > 2 ? "CRITICAL" : "HIGH" });
  }

  if (input.overdueMilestones > 0) {
    actions.push({ title: "Recover overdue milestones", description: "Review dependencies, blockers and resource constraints, then re-plan the delivery path.", owner: "PROJECT_MANAGER", urgency: input.overdueMilestones > 2 ? "HIGH" : "MEDIUM" });
  }

  if (input.transformationStatus === "VALUE_INTERVENTION") {
    actions.push({ title: "Review value realization", description: "Validate whether outcomes remain measurable, achievable and connected to the original transformation objectives.", owner: "SPONSOR", urgency: "HIGH" });
  }

  if (input.transformationStatus === "DELIVERY_INTERVENTION") {
    actions.push({ title: "Re-baseline delivery plan", description: "Review scope, timeline, dependencies and ownership to restore execution control.", owner: "PROJECT_MANAGER", urgency: "HIGH" });
  }

  if (actions.length === 0 && input.predictiveRiskLevel === "MODERATE") {
    actions.push({ title: "Increase monitoring cadence", description: "Review the project weekly and track leading indicators for further deterioration.", owner: "PROJECT_MANAGER", urgency: "MEDIUM" });
  }

  return actions;
}