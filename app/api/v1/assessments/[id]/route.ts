import { jsonError } from "../../../../../lib/api/errors";
import { getAssessment } from "../../../../../lib/assessments/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const assessment = getAssessment(id);

  if (!assessment) {
    return jsonError("Assessment not found.", 404, "ASSESSMENT_NOT_FOUND");
  }

  return Response.json({
    id: assessment.id,
    assessmentType: assessment.assessmentType,
    frameworkVersion: assessment.frameworkVersion,
    engineVersion: assessment.engineVersion,
    status: assessment.status,
    progress: {
      answered: assessment.responses.length,
      total: 14,
    },
    responses: assessment.responses,
    createdAt: assessment.createdAt,
    updatedAt: assessment.updatedAt,
    completedAt: assessment.completedAt ?? null,
  });
}
