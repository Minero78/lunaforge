import type { ConsultingOpportunity } from "@/lib/intelligence/opportunities";
import type { RoiResult } from "@/lib/value/roi";

export type CommercialOpportunity = ConsultingOpportunity & {
  id: string;
  organizationId: string;
  stage: "IDENTIFIED" | "QUALIFIED" | "PROPOSED" | "WON" | "LOST";
  estimatedValue?: number;
  currency?: string;
  roi?: RoiResult;
  assessmentId: string;
  createdAt: string;
  updatedAt: string;
};

export function toCommercialOpportunity(
  opportunity: ConsultingOpportunity,
  assessmentId: string,
  organizationId: string,
  id = `${assessmentId}:${opportunity.dimension}`,
): CommercialOpportunity {
  const now = new Date().toISOString();
  return {
    ...opportunity,
    id,
    organizationId,
    assessmentId,
    stage: "IDENTIFIED",
    createdAt: now,
    updatedAt: now,
  };
}

export function advanceOpportunityStage(
  opportunity: CommercialOpportunity,
  stage: CommercialOpportunity["stage"],
): CommercialOpportunity {
  if (opportunity.stage === "WON" || opportunity.stage === "LOST") {
    throw new Error("CLOSED_OPPORTUNITY_IMMUTABLE");
  }
  return { ...opportunity, stage, updatedAt: new Date().toISOString() };
}
