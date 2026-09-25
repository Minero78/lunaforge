import { jsonError } from "../../../../../../lib/api/errors";
import { assessmentRepository } from "../../../../../../lib/assessments/service";

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const assessment = await assessmentRepository.completeAssessment(id);
    return Response.json({ id: assessment.id, status: assessment.status, result: assessment.result, completedAt: assessment.completedAt });
  } catch (error) {
    const code = error instanceof Error ? error.message : "ASSESSMENT_COMPLETION_ERROR";
    if (code === "ASSESSMENT_NOT_FOUND") return jsonError("Assessment not found.", 404, code);
    if (code === "ASSESSMENT_COMPLETION_CONFLICT") return jsonError("Assessment completion conflict. Please retry.", 409, code);
    if (code.startsWith("Missing response")) return jsonError(code, 400, "ASSESSMENT_VALIDATION_ERROR");
    if (code === "ORGANIZATION_CONTEXT_REQUIRED") return jsonError("An authenticated organization is required.", 401, code);
    return jsonError("Unable to complete assessment.", 500, "ASSESSMENT_COMPLETION_ERROR");
  }
}
