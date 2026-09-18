import { MIS_QUICKSCAN_QUESTIONS } from "../mis/questions";
import { calculateMisScore } from "../mis/scoring";
import type { MisResponse, MisScoringResult } from "../mis/types";

export type AssessmentStatus = "IN_PROGRESS" | "SCORED";

export interface AssessmentRecord {
  id: string;
  assessmentType: "QUICKSCAN";
  frameworkVersion: "MIS-1.0";
  engineVersion: "ENGINE-1.0";
  status: AssessmentStatus;
  responses: MisResponse[];
  result?: MisScoringResult;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * Temporary repository adapter for the API foundation.
 *
 * This store is intentionally isolated so it can be replaced by Supabase
 * without changing the Route Handler contracts. It is not durable storage
 * and should not be treated as production persistence.
 */
const assessments = new Map<string, AssessmentRecord>();

export function createAssessment(): AssessmentRecord {
  const now = new Date().toISOString();
  const assessment: AssessmentRecord = {
    id: crypto.randomUUID(),
    assessmentType: "QUICKSCAN",
    frameworkVersion: "MIS-1.0",
    engineVersion: "ENGINE-1.0",
    status: "IN_PROGRESS",
    responses: [],
    createdAt: now,
    updatedAt: now,
  };

  assessments.set(assessment.id, assessment);
  return assessment;
}

export function getAssessment(id: string): AssessmentRecord | undefined {
  return assessments.get(id);
}

export function saveResponse(
  assessment: AssessmentRecord,
  questionId: string,
  score: MisResponse["score"],
): AssessmentRecord {
  if (assessment.status === "SCORED") {
    throw new Error("ASSESSMENT_ALREADY_COMPLETED");
  }

  const question = MIS_QUICKSCAN_QUESTIONS.find((item) => item.id === questionId);
  if (!question || !question.active) {
    throw new Error("UNKNOWN_QUESTION");
  }

  const existingIndex = assessment.responses.findIndex(
    (response) => response.questionId === questionId,
  );

  const response: MisResponse = { questionId, score };
  if (existingIndex >= 0) {
    assessment.responses[existingIndex] = response;
  } else {
    assessment.responses.push(response);
  }

  assessment.updatedAt = new Date().toISOString();
  return assessment;
}

export function completeAssessment(assessment: AssessmentRecord): AssessmentRecord {
  if (assessment.status === "SCORED" && assessment.result) {
    return assessment;
  }

  const result = calculateMisScore(assessment.responses, MIS_QUICKSCAN_QUESTIONS);
  const now = new Date().toISOString();

  assessment.result = result;
  assessment.status = "SCORED";
  assessment.completedAt = now;
  assessment.updatedAt = now;

  return assessment;
}
