import { supabaseAssessmentRepository } from "../supabase/assessment-repository";
import {
  completeAssessment as completeMemoryAssessment,
  createAssessment as createMemoryAssessment,
  getAssessment as getMemoryAssessment,
  saveResponse as saveMemoryResponse,
} from "./store";
import type { AssessmentRepository } from "./repository";
import type { MisResponse } from "../mis/types";

const useSupabase = process.env.STRATOVA_PERSISTENCE === "supabase";

export const assessmentRepository: AssessmentRepository = useSupabase
  ? supabaseAssessmentRepository
  : {
      async createAssessment() {
        return createMemoryAssessment();
      },
      async getAssessment(id) {
        return getMemoryAssessment(id);
      },
      async saveResponse(assessmentId, questionId, score: MisResponse["score"]) {
        const assessment = getMemoryAssessment(assessmentId);
        if (!assessment) throw new Error("ASSESSMENT_NOT_FOUND");
        return saveMemoryResponse(assessment, questionId, score);
      },
      async completeAssessment(id) {
        const assessment = getMemoryAssessment(id);
        if (!assessment) throw new Error("ASSESSMENT_NOT_FOUND");
        return completeMemoryAssessment(assessment);
      },
    };
