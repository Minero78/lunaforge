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

const priorityRank: Record<ConsultingOpportunity["priority"], number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function deriveConsultingOpportunities(result: MisScoringResult): ConsultingOpportunity[] {
  return result.dimensionScores
    .reduce<ConsultingOpportunity[]>((items, dimension) => {
      const key = dimension.dimension.toLowerCase();
      const mapped = serviceMap[key];
      if (!mapped) return items;
      const priority = dimension.score < 41 ? "HIGH" : dimension.score < 61 ? "MEDIUM" : "LOW";
      const impact = dimension.score < 41 ? "HIGH" : "MEDIUM";
      items.push({
        dimension: dimension.dimension,
        title: mapped.title,
        rationale: `${dimension.dimension} scored ${dimension.score}/100, indicating a ${priority.toLowerCase()}-priority improvement opportunity.`,
        suggestedService: mapped.service,
        priority,
        impact,
      });
      return items;
    }, [])
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
}
