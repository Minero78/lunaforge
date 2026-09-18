export const interventionActionStatuses = ["RECOMMENDED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;

export type InterventionActionStatus = typeof interventionActionStatuses[number];

export type InterventionAction = {
  id: string;
  projectId: string;
  organizationId: string;
  title: string;
  description: string | null;
  recommendedOwner: string | null;
  assignedTo: string | null;
  urgency: string;
  status: InterventionActionStatus;
  baselineRiskScore: number | null;
  baselineDeliveryHealth: string | null;
  baselineOutcomeHealth: string | null;
  createdAt: string;
  completedAt: string | null;
};

export function isInterventionActionStatus(value: unknown): value is InterventionActionStatus {
  return typeof value === "string" && interventionActionStatuses.includes(value as InterventionActionStatus);
}

export function calculateInterventionEffectiveness(input: {
  baselineRiskScore: number | null;
  currentRiskScore: number;
  baselineDeliveryHealth: string | null;
  currentDeliveryHealth: string;
  baselineOutcomeHealth: string | null;
  currentOutcomeHealth: string;
}) {
  const riskDelta = input.baselineRiskScore === null ? null : input.baselineRiskScore - input.currentRiskScore;
  const improved = riskDelta !== null && riskDelta > 0;

  return {
    riskDelta,
    riskImproved: improved,
    deliveryChanged: input.baselineDeliveryHealth !== null && input.baselineDeliveryHealth !== input.currentDeliveryHealth,
    outcomeChanged: input.baselineOutcomeHealth !== null && input.baselineOutcomeHealth !== input.currentOutcomeHealth,
  };
}