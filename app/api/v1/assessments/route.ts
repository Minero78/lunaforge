import { jsonError } from "../../../../lib/api/errors";
import { createAssessment } from "../../../../lib/assessments/store";

export async function POST() {
  const assessment = createAssessment();

  return Response.json(
    {
      id: assessment.id,
      assessmentType: assessment.assessmentType,
      frameworkVersion: assessment.frameworkVersion,
      engineVersion: assessment.engineVersion,
      status: assessment.status,
      progress: {
        answered: 0,
        total: 14,
      },
      createdAt: assessment.createdAt,
    },
    { status: 201 },
  );
}

export async function GET() {
  return jsonError(
    "Assessment id is required. Use /api/v1/assessments/:id.",
    400,
    "ASSESSMENT_ID_REQUIRED",
  );
}
