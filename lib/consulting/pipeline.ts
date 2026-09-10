export type OpportunityStage = "IDENTIFIED" | "QUALIFIED" | "PROPOSED" | "WON" | "LOST";
export type ConsultingOpportunityRecord = {
  id: string;
  organizationId: string;
  title: string;
  service: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  impact: "HIGH" | "MEDIUM" | "LOW";
  stage: OpportunityStage;
  estimatedValue?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
};

export const OPPORTUNITY_STAGES: OpportunityStage[] = ["IDENTIFIED", "QUALIFIED", "PROPOSED", "WON", "LOST"];

export function pipelineSummary(items: ConsultingOpportunityRecord[]) {
  return OPPORTUNITY_STAGES.map((stage) => {
    const opportunities = items.filter((item) => item.stage === stage);
    const value = opportunities.reduce((sum, item) => sum + (item.estimatedValue ?? 0), 0);
    return { stage, count: opportunities.length, estimatedValue: value };
  });
}
