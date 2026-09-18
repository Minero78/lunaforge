import type { MisDimensionResult, MisScoringResult } from "./types";

export type MisPersistedResult = MisScoringResult & {
  strengths: string[];
  gaps: string[];
  constraints: string[];
  opportunities: string[];
  roadmap: string[];
};

export function withDerivedResultContext(result: MisScoringResult): MisPersistedResult {
  const ordered = [...result.dimensionScores].sort((a, b) => a.score - b.score);
  const strengths = ordered.filter((item) => item.score >= 75).map((item) => item.dimension);
  const gaps = ordered.filter((item) => item.score < 50).map((item) => item.dimension);
  const constraints = ordered.filter((item) => item.score < 75).slice(0, 3).map((item) => item.dimension);
  const opportunities = ordered.slice(0, 3).map((item) => item.dimension);
  const roadmap = ordered.map((item) => item.dimension);

  return { ...result, strengths, gaps, constraints, opportunities, roadmap };
}

export function parsePersistedResult(value: {
  overall_score: number | string;
  maturity: MisScoringResult["maturity"];
  dimension_scores: MisDimensionResult[];
  strengths?: unknown;
  gaps?: unknown;
  constraints?: unknown;
  opportunities?: unknown;
  roadmap?: unknown;
}): MisPersistedResult {
  const base: MisScoringResult = {
    frameworkVersion: "MIS-1.0",
    engineVersion: "ENGINE-1.0",
    overallScore: Number(value.overall_score),
    maturity: value.maturity,
    dimensionScores: value.dimension_scores,
  };

  return {
    ...base,
    strengths: asStringArray(value.strengths),
    gaps: asStringArray(value.gaps),
    constraints: asStringArray(value.constraints),
    opportunities: asStringArray(value.opportunities),
    roadmap: asStringArray(value.roadmap),
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
