import type { MisScoringResult } from "../mis/types";

export type ConsultingOpportunity = {
  dimension: string;
  title: string;
  rationale: string;
  suggestedService: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  impact: "HIGH" | "MEDIUM" | "LOW";
};

const serviceMap: Record<string, { title: string; service: string }> = {
  engineering: { title: "Engineering data integration", service: "Engineering workflow and data integration advisory" },
  operations: { title: "Operational intelligence", service: "Operational performance and process optimization" },
  data: { title: "Mining data foundation", service: "Mining data architecture and governance" },
  spatial: { title: "Spatial intelligence", service: "Drone, GIS and geospatial intelligence integration" },
  digital: { title: "Digital operating model", service: "Digital transformation roadmap and implementation advisory" },
  ai: { title: "AI readiness", service: "Applied AI strategy and use-case implementation" },
  value: { title: "Value realization", service: "Mining technology value realization and benefits management" },
};

export function deriveConsultingOpportunities(result: MisScoringResult): ConsultingOpportunity[] {
  return result.dimensionScores
    .map((dimension) => {
      const key = dimension.dimension.toLowerCase();
      const mapped = Object.entries(serviceMap).find(([name]) => key.includes(name));
      if (!mapped) return null;
      const [, service] = mapped;
      const priority: ConsultingOpportunity["priority"] = dimension.score < 41 ? "HIGH" : dimension.score < 61 ? "MEDIUM" : "LOW";
      const impact: ConsultingOpportunity["impact"] = dimension.score < 41 ? "HIGH" : "MEDIUM";
      return {
        dimension: dimension.dimension,
        title: service.title,
        rationale: `${dimension.dimension} scored ${dimension.score}/100, indicating a ${priority.toLowerCase()}-priority improvement opportunity.`,
        suggestedService: service.service,
        priority,
        impact,
      };
    })
    .filter((item): item is ConsultingOpportunity => item !== null)
    .sort((a, b) => ({ HIGH: 0, MEDIUM: 1, LOW: 2 }[a.priority] - { HIGH: 0, MEDIUM: 1, LOW: 2 }[b.priority]));
}
