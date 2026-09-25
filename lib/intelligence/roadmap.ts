import type { ConsultingOpportunity } from "./opportunities";

export type RoadmapPhase = {
  horizon: "0-90_DAYS" | "3-6_MONTHS" | "6-12_MONTHS" | "12-24_MONTHS";
  objective: string;
  opportunities: ConsultingOpportunity[];
};

export function buildTransformationRoadmap(opportunities: ConsultingOpportunity[]): RoadmapPhase[] {
  const high = opportunities.filter((item) => item.priority === "HIGH");
  const medium = opportunities.filter((item) => item.priority === "MEDIUM");
  return [
    { horizon: "0-90_DAYS", objective: "Establish the baseline, governance, and highest-priority quick wins.", opportunities: high.slice(0, 3) },
    { horizon: "3-6_MONTHS", objective: "Build the operating capabilities required to scale improvement.", opportunities: [...high.slice(3), ...medium.slice(0, 2)] },
    { horizon: "6-12_MONTHS", objective: "Scale digital, data, spatial, and AI capabilities into operating workflows.", opportunities: medium.slice(2) },
    { horizon: "12-24_MONTHS", objective: "Institutionalize continuous intelligence and value realization.", opportunities: opportunities.filter((item) => item.priority === "LOW") },
  ];
}
