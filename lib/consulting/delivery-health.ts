export type DeliveryHealth = "ON_TRACK" | "WATCH" | "AT_RISK" | "COMPLETE";

export type DeliveryHealthInput = {
  totalMilestones: number;
  completedMilestones: number;
  overdueMilestones: number;
  highRiskMilestones: number;
  highOpenRisks: number;
};

export function calculateDeliveryHealth(input: DeliveryHealthInput) {
  const progress = input.totalMilestones ? Math.round((input.completedMilestones / input.totalMilestones) * 100) : 0;
  const criticalSignals = input.highRiskMilestones + input.highOpenRisks;
  const health: DeliveryHealth =
    criticalSignals > 0 ? "AT_RISK" :
    input.overdueMilestones > 0 ? "WATCH" :
    input.totalMilestones > 0 && input.completedMilestones === input.totalMilestones ? "COMPLETE" :
    "ON_TRACK";

  return {
    health,
    progress,
    criticalSignals,
    interventionRequired: health === "AT_RISK" || health === "WATCH",
  };
}