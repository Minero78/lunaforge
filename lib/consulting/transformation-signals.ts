export type TransformationSignalLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
export type TransformationTrend = "IMPROVING" | "STABLE" | "DETERIORATING";

export type TransformationSignalInput = {
  deliveryHealth: string;
  outcomeHealth: string;
  overdueMilestones: number;
  highOpenRisks: number;
  totalMilestones: number;
  completedMilestones: number;
  totalOutcomes: number;
  achievedOutcomes: number;
};

export function calculateTransformationSignals(input: TransformationSignalInput) {
  let score = 0;
  const signals: string[] = [];

  if (input.deliveryHealth === "AT_RISK") { score += 25; signals.push("Delivery health is at risk"); }
  else if (input.deliveryHealth === "WATCH") { score += 12; signals.push("Delivery health requires monitoring"); }

  if (input.outcomeHealth === "OFF_TARGET") { score += 25; signals.push("Outcomes are off target"); }
  else if (input.outcomeHealth === "WATCH") { score += 12; signals.push("Outcome realization requires monitoring"); }

  if (input.overdueMilestones > 0) { score += Math.min(20, input.overdueMilestones * 5); signals.push(`${input.overdueMilestones} overdue milestone(s)`); }
  if (input.highOpenRisks > 0) { score += Math.min(25, input.highOpenRisks * 10); signals.push(`${input.highOpenRisks} high open risk(s)`); }

  const deliveryProgress = input.totalMilestones ? Math.round((input.completedMilestones / input.totalMilestones) * 100) : 0;
  const outcomeProgress = input.totalOutcomes ? Math.round((input.achievedOutcomes / input.totalOutcomes) * 100) : 0;

  if (input.totalOutcomes > 0 && outcomeProgress < deliveryProgress - 30) {
    score += 15;
    signals.push("Value realization is materially lagging delivery execution");
  }

  score = Math.min(100, score);
  const level: TransformationSignalLevel = score > 80 ? "CRITICAL" : score > 60 ? "HIGH" : score > 30 ? "MODERATE" : "LOW";
  const trend: TransformationTrend = score > 60 ? "DETERIORATING" : score < 20 ? "IMPROVING" : "STABLE";

  return { score, level, trend, signals, deliveryProgress, outcomeProgress };
}