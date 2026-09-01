import { createSupabaseServerClient } from "./server";
import { MIS_QUICKSCAN_QUESTIONS } from "../mis/questions";
import { calculateMisScore } from "../mis/scoring";
import type { MisResponse, MisScoringResult } from "../mis/types";
import type { AssessmentRecord } from "../assessments/store";
import type { AssessmentRepository } from "../assessments/repository";

function toRecord(
  row: {
    id: string;
    assessment_type: "QUICKSCAN";
    framework_version: "MIS-1.0";
    engine_version: "ENGINE-1.0";
    status: "IN_PROGRESS" | "SCORED" | "ARCHIVED";
    created_at: string;
    updated_at: string;
    completed_at: string | null;
  },
  responses: MisResponse[],
  result?: MisScoringResult,
): AssessmentRecord {
  if (row.status === "ARCHIVED") {
    throw new Error("ARCHIVED_ASSESSMENT");
  }

  return {
    id: row.id,
    assessmentType: row.assessment_type,
    frameworkVersion: row.framework_version,
    engineVersion: row.engine_version,
    status: row.status,
    responses,
    result,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? undefined,
  };
}

async function loadResponses(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, assessmentId: string) {
  const { data, error } = await supabase
    .from("assessment_responses")
    .select("question_id, score")
    .eq("assessment_id", assessmentId);

  if (error) throw new Error(`ASSESSMENT_RESPONSES_READ_FAILED:${error.message}`);

  return (data ?? []).map((row) => ({
    questionId: row.question_id,
    score: row.score as MisResponse["score"],
  }));
}

async function loadResult(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, assessmentId: string) {
  const { data, error } = await supabase
    .from("assessment_results")
    .select("overall_score, maturity, dimension_scores, strengths, gaps, constraints, opportunities, roadmap")
    .eq("assessment_id", assessmentId)
    .maybeSingle();

  if (error) throw new Error(`ASSESSMENT_RESULT_READ_FAILED:${error.message}`);
  if (!data) return undefined;

  return {
    overallScore: Number(data.overall_score),
    maturity: data.maturity,
    dimensionScores: data.dimension_scores,
    strengths: data.strengths,
    gaps: data.gaps,
    constraints: data.constraints,
    opportunities: data.opportunities,
    roadmap: data.roadmap,
  } as unknown as MisScoringResult;
}

export const supabaseAssessmentRepository: AssessmentRepository = {
  async createAssessment() {
    throw new Error("ORGANIZATION_CONTEXT_REQUIRED");
  },

  async getAssessment(id) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("assessments")
      .select("id, assessment_type, framework_version, engine_version, status, created_at, updated_at, completed_at")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`ASSESSMENT_READ_FAILED:${error.message}`);
    if (!data) return undefined;

    const responses = await loadResponses(supabase, id);
    const result = await loadResult(supabase, id);
    return toRecord(data, responses, result);
  },

  async saveResponse(assessmentId, questionId, score) {
    const supabase = await createSupabaseServerClient();
    const question = MIS_QUICKSCAN_QUESTIONS.find((item) => item.id === questionId && item.active);
    if (!question) throw new Error("UNKNOWN_QUESTION");

    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select("id, assessment_type, framework_version, engine_version, status, created_at, updated_at, completed_at")
      .eq("id", assessmentId)
      .maybeSingle();

    if (assessmentError) throw new Error(`ASSESSMENT_READ_FAILED:${assessmentError.message}`);
    if (!assessment) return Promise.reject(new Error("ASSESSMENT_NOT_FOUND"));
    if (assessment.status === "SCORED") return Promise.reject(new Error("ASSESSMENT_ALREADY_COMPLETED"));

    const { error } = await supabase
      .from("assessment_responses")
      .upsert({ assessment_id: assessmentId, question_id: questionId, score }, { onConflict: "assessment_id,question_id" });

    if (error) throw new Error(`ASSESSMENT_RESPONSE_WRITE_FAILED:${error.message}`);

    const responses = await loadResponses(supabase, assessmentId);
    const result = await loadResult(supabase, assessmentId);
    return toRecord(assessment, responses, result);
  },

  async completeAssessment(id) {
    const supabase = await createSupabaseServerClient();
    const { data: assessment, error } = await supabase
      .from("assessments")
      .select("id, assessment_type, framework_version, engine_version, status, created_at, updated_at, completed_at")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`ASSESSMENT_READ_FAILED:${error.message}`);
    if (!assessment) throw new Error("ASSESSMENT_NOT_FOUND");

    const responses = await loadResponses(supabase, id);
    if (assessment.status === "SCORED") {
      const result = await loadResult(supabase, id);
      if (!result) throw new Error("SCORED_RESULT_MISSING");
      return toRecord(assessment, responses, result);
    }

    const result = calculateMisScore(responses, MIS_QUICKSCAN_QUESTIONS);
    const now = new Date().toISOString();

    const { error: resultError } = await supabase.from("assessment_results").upsert({
      assessment_id: id,
      overall_score: result.overallScore,
      maturity: result.maturity,
      dimension_scores: result.dimensionScores,
      strengths: result.strengths,
      gaps: result.gaps,
      constraints: result.constraints,
      opportunities: result.opportunities,
      roadmap: result.roadmap,
      framework_version: "MIS-1.0",
      engine_version: "ENGINE-1.0",
      calculated_at: now,
    }, { onConflict: "assessment_id" });

    if (resultError) throw new Error(`ASSESSMENT_RESULT_WRITE_FAILED:${resultError.message}`);

    const { data: updated, error: updateError } = await supabase
      .from("assessments")
      .update({ status: "SCORED", completed_at: now, updated_at: now })
      .eq("id", id)
      .eq("status", "IN_PROGRESS")
      .select("id, assessment_type, framework_version, engine_version, status, created_at, updated_at, completed_at")
      .maybeSingle();

    if (updateError) throw new Error(`ASSESSMENT_COMPLETE_FAILED:${updateError.message}`);
    if (!updated) throw new Error("ASSESSMENT_COMPLETION_CONFLICT");

    return toRecord(updated, responses, result);
  },
};
