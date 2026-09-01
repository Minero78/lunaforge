import type { StratovaResultDiagnosis } from "@/lib/results/types";
import type { MisScoringResult } from "@/lib/mis/types";

export interface StratovaReportData {
  reportVersion: "REPORT-1.0";
  generatedAt: string;
  assessmentId: string;
  frameworkVersion: MisScoringResult["frameworkVersion"];
  engineVersion: MisScoringResult["engineVersion"];
  score: number;
  maturity: MisScoringResult["maturity"];
  dimensionScores: MisScoringResult["dimensionScores"];
  diagnosis: StratovaResultDiagnosis;
  methodology: {
    scale: "1–5 normalized to 0–100";
    dimensions: 7;
    questions: 14;
  };
}
