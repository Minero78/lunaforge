import { jsonError } from "../../../../lib/api/errors";
import { assessmentRepository } from "../../../../lib/assessments/service";

export async function POST() {
  try {
    const assessment = await assessmentRepository.createAssessment();

    return Response.json(
      {
        id: assessment.id,
        assessmentType: assessment.assessmentType,
        frameworkVersion: assessment.frameworkVersion,
        engineVersion: assessment.engineVersion,
        status: assessment.status,
        progress: { answered: 0, total: 14 },
        createdAt: assessment.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "ORGANIZATION_CONTEXT_REQUIRED") {
      return jsonError("An authenticated organization is required.", 401, "ORGANIZATION_CONTEXT_REQUIRED");
    }
    return jsonError("Unable to create assessment.", 500, "ASSESSMENT_CREATE_ERROR");
  }
}

export async function GET() {
  return jsonError("Assessment id is required. Use /api/v1/assessments/:id.", 400, "ASSESSMENT_ID_REQUIRED");
}
