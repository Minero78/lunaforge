export const MIS_FRAMEWORK_VERSION = "MIS-1.0" as const;
export const MIS_ENGINE_VERSION = "ENGINE-1.0" as const;

export const MIS_DIMENSIONS = [
  "engineering",
  "operations",
  "data",
  "spatial",
  "digital",
  "ai",
  "value",
] as const;

export type MisDimension = (typeof MIS_DIMENSIONS)[number];
export type MisScore = 1 | 2 | 3 | 4 | 5;

export interface MisQuestion {
  id: string;
  dimension: MisDimension;
  indicator: string;
  question: string;
  weight: number;
  required: boolean;
  active: boolean;
}

export interface MisResponse {
  questionId: string;
  score: MisScore;
}

export interface MisDimensionResult {
  dimension: MisDimension;
  score: number;
  maturity: MisMaturity;
}

export type MisMaturity =
  | "Fragmented"
  | "Structured"
  | "Connected"
  | "Intelligent"
  | "Adaptive";

export interface MisScoringResult {
  frameworkVersion: typeof MIS_FRAMEWORK_VERSION;
  engineVersion: typeof MIS_ENGINE_VERSION;
  overallScore: number;
  maturity: MisMaturity;
  dimensionScores: MisDimensionResult[];
}
