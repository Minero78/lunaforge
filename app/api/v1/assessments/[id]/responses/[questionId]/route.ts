import { jsonError } from "../../../../../../../lib/api/errors";
import { getAssessment, saveResponse } from "../../../../../../../lib/assessments/store";

interface RouteContext {
  params: Promise<{ id: string; questionId: string }>;
}

function isScore(value: unknown): value is 1 | 2 | 3 | 4 | 5 {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

export async function PUT(request: Request, context: RouteContext) {
  const { id, questionId } = await context.params;
  const assessment = getAssessment(id);

  if (!assessment) {
    return jsonError("Assessment not found.", 404, "ASSESSMENT_NOT_FOUND");
  }

  if (assessment.status === "SCORED") {
    return jsonError(
      "This assessment has already been completed.",
      409,
      "ASSESSMENT_ALREADY_COMPLETED",
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400, "INVALID_JSON");
  }

  if (!body || typeof body !== "object" || !("score" in body)) {
    return jsonError("A score from 1 to 5 is required.", 400, "SCORE_REQUIRED");
  }

  const score = (body as { score: unknown }).score;
  if (!isScore(score)) {
    return jsonError("Score must be an integer from 1 to 5.", 400, "INVALID_SCORE");
  }

  try {
    saveResponse(assessment, questionId, score);
  } catch (error) {
    if (error instanceof Error && error.message === "UNKNOWN_QUESTION") {
      return jsonError("Question not found or inactive.", 404, "UNKNOWN_QUESTION");
    }
    throw error;
  }

  return Response.json({
    assessmentId: assessment.id,
    questionId,
    score,
    status: assessment.status,
    progress: {
      answered: assessment.responses.length,
      total: 14,
    },
    updatedAt: assessment.updatedAt,
  });
}
