import type { MisResponse, MisScoringResult } from "../mis/types";
import type { AssessmentRecord } from "./store";

export interface AssessmentRepository {
  createAssessment(): Promise<AssessmentRecord>;
  getAssessment(id: string): Promise<AssessmentRecord | undefined>;
  saveResponse(
    assessmentId: string,
    questionId: string,
    score: MisResponse["score"],
  ): Promise<AssessmentRecord>;
  completeAssessment(id: string): Promise<AssessmentRecord>;
}

export type PersistedAssessment = {
  id: string;
  assessmentType: "QUICKSCAN";
  frameworkVersion: "MIS-1.0";
  engineVersion: "ENGINE-1.0";
  status: "IN_PROGRESS" | "SCORED";
  responses: MisResponse[];
  result?: MisScoringResult;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};
