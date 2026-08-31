import { buildResultDiagnosis } from "@/lib/results/diagnosis";
import type { MisScoringResult } from "@/lib/mis/types";
import type { StratovaReportData } from "./types";

export function buildReportData(assessmentId: string, result: MisScoringResult): StratovaReportData {
  return {
    reportVersion: "REPORT-1.0",
    generatedAt: new Date().toISOString(),
    assessmentId,
    frameworkVersion: result.frameworkVersion,
    engineVersion: result.engineVersion,
    score: result.overallScore,
    maturity: result.maturity,
    dimensionScores: result.dimensionScores,
    diagnosis: buildResultDiagnosis(result),
    methodology: {
      scale: "1–5 normalized to 0–100",
      dimensions: 7,
      questions: 14,
    },
  };
}
