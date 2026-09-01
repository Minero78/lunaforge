import { jsonError } from "../../../../../../../lib/api/errors";
import { assessmentRepository } from "../../../../../../../lib/assessments/service";

interface RouteContext { params: Promise<{ id: string; questionId: string }> }
function isScore(value: unknown): value is 1 | 2 | 3 | 4 | 5 { return value === 1 || value === 2 || value === 3 || value === 4 || value === 5; }

export async function PUT(request: Request, context: RouteContext) {
  const { id, questionId } = await context.params;
  const assessment = await assessmentRepository.getAssessment(id);
  if (!assessment) return jsonError("Assessment not found.", 404, "ASSESSMENT_NOT_FOUND");
  if (assessment.status === "SCORED") return jsonError("This assessment has already been completed.", 409, "ASSESSMENT_ALREADY_COMPLETED");

  let body: unknown;
  try { body = await request.json(); } catch { return jsonError("Request body must be valid JSON.", 400, "INVALID_JSON"); }
  if (!body || typeof body !== "object" || !("score" in body)) return jsonError("A score from 1 to 5 is required.", 400, "SCORE_REQUIRED");
  const score = (body as { score: unknown }).score;
  if (!isScore(score)) return jsonError("Score must be an integer from 1 to 5.", 400, "INVALID_SCORE");

  try {
    const updated = await assessmentRepository.saveResponse(id, questionId, score);
    return Response.json({ assessmentId: updated.id, questionId, score, status: updated.status, progress: { answered: updated.responses.length, total: 14 }, updatedAt: updated.updatedAt });
  } catch (error) {
    const code = error instanceof Error ? error.message : "ASSESSMENT_RESPONSE_ERROR";
    if (code === "UNKNOWN_QUESTION") return jsonError("Question not found or inactive.", 404, code);
    if (code === "ASSESSMENT_ALREADY_COMPLETED") return jsonError("This assessment has already been completed.", 409, code);
    if (code === "ASSESSMENT_NOT_FOUND") return jsonError("Assessment not found.", 404, code);
    return jsonError("Unable to save response.", 500, "ASSESSMENT_RESPONSE_ERROR");
  }
}
