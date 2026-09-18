import { jsonError } from "../../../../../../lib/api/errors";
import { completeAssessment, getAssessment } from "../../../../../../lib/assessments/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const assessment = getAssessment(id);

  if (!assessment) {
    return jsonError("Assessment not found.", 404, "ASSESSMENT_NOT_FOUND");
  }

  if (assessment.status === "SCORED" && assessment.result) {
    return Response.json({
      id: assessment.id,
      status: assessment.status,
      result: assessment.result,
      completedAt: assessment.completedAt,
    });
  }

  try {
    completeAssessment(assessment);
  } catch (error) {
    if (error instanceof Error) {
      return jsonError(error.message, 400, "ASSESSMENT_VALIDATION_ERROR");
    }
    return jsonError("Unable to complete assessment.", 500, "ASSESSMENT_COMPLETION_ERROR");
  }

  return Response.json({
    id: assessment.id,
    status: assessment.status,
    result: assessment.result,
    completedAt: assessment.completedAt,
  });
}
