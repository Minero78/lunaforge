import type { MisScoringResult } from "../mis/types";

export type AssessmentSnapshot = {
  id: string;
  siteId?: string;
  completedAt: string;
  overallScore: number;
  maturity: MisScoringResult["maturity"];
  dimensionScores: MisScoringResult["dimensionScores"];
};

export type IntelligenceTrend = {
  current?: AssessmentSnapshot;
  previous?: AssessmentSnapshot;
  delta: number | null;
  direction: "UP" | "DOWN" | "STABLE" | "NO_BASELINE";
};

export function buildIntelligenceTrend(history: AssessmentSnapshot[]): IntelligenceTrend {
  const ordered = [...history].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  const current = ordered.at(-1);
  const previous = ordered.at(-2);
  if (!current || !previous) return { current, previous, delta: null, direction: "NO_BASELINE" };
  const delta = Number((current.overallScore - previous.overallScore).toFixed(1));
  return { current, previous, delta, direction: delta > 0 ? "UP" : delta < 0 ? "DOWN" : "STABLE" };
}

export function buildDimensionTrends(history: AssessmentSnapshot[]) {
  const ordered = [...history].sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  const current = ordered.at(-1);
  const previous = ordered.at(-2);
  if (!current) return [];
  return current.dimensionScores.map((dimension) => {
    const prior = previous?.dimensionScores.find((item) => item.dimension === dimension.dimension);
    const delta = prior ? Number((dimension.score - prior.score).toFixed(1)) : null;
    return { dimension: dimension.dimension, score: dimension.score, delta };
  });
}
