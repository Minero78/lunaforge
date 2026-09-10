import type { MisScoringResult } from "../mis/types";
import type { ConsultingOpportunity } from "../intelligence/opportunities";
import type { RoadmapPhase } from "../intelligence/roadmap";

export type ExecutiveReport = {
  title: string;
  generatedAt: string;
  frameworkVersion: string;
  executiveSummary: string;
  overallScore: number;
  maturity: string;
  dimensionHighlights: Array<{ dimension: string; score: number; maturity: string }>;
  priorityActions: ConsultingOpportunity[];
  roadmap: RoadmapPhase[];
  disclaimer: string;
};

export function buildExecutiveReport(
  clientName: string,
  result: MisScoringResult,
  opportunities: ConsultingOpportunity[],
  roadmap: RoadmapPhase[],
  generatedAt = new Date().toISOString(),
): ExecutiveReport {
  const priorityActions = opportunities.slice(0, 5);
  return {
    title: `Mining Intelligence Executive Report — ${clientName}`,
    generatedAt,
    frameworkVersion: result.frameworkVersion,
    executiveSummary:
      `${clientName} has an overall Mining Intelligence Score of ${result.overallScore}/100, ` +
      `corresponding to ${result.maturity} maturity. The assessment identifies ${opportunities.length} improvement opportunities, ` +
      `with the highest priorities sequenced into an actionable transformation roadmap.`,
    overallScore: result.overallScore,
    maturity: result.maturity,
    dimensionHighlights: result.dimensionScores.map((item) => ({
      dimension: item.dimension,
      score: item.score,
      maturity: item.maturity,
    })),
    priorityActions,
    roadmap,
    disclaimer:
      "This report is a decision-support assessment. It does not constitute a geotechnical, safety, legal, financial, or operational assurance opinion.",
  };
}
