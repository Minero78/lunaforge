import type { MisDimension, MisMaturity, MisScoringResult } from "@/lib/mis/types";

export interface ResultInsight {
  dimension: MisDimension;
  score: number;
  title: string;
  description: string;
}

export interface ResultOpportunity {
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  effort: "Low" | "Medium" | "High";
  readiness: "High" | "Medium" | "Low";
  priority: "Priority 1" | "Priority 2" | "Priority 3";
}

export interface ResultRecommendation {
  title: string;
  rationale: string;
  horizon: "0–90 days" | "3–6 months" | "6–12 months";
}

export interface StratovaResultDiagnosis {
  overallScore: number;
  maturity: MisMaturity;
  strongestCapability: ResultInsight;
  developmentAreas: ResultInsight[];
  primaryConstraint: ResultInsight;
  opportunity: ResultOpportunity;
  recommendations: ResultRecommendation[];
}

export interface StratovaResultPayload extends MisScoringResult {
  assessmentId: string;
  completedAt: string;
  diagnosis: StratovaResultDiagnosis;
}
