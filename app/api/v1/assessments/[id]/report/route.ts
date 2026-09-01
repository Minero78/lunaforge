import { jsonError } from "../../../../../../lib/api/errors";
import { getAssessment } from "../../../../../../lib/assessments/store";
import { buildReportData } from "../../../../../../lib/reports/builder";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const assessment = getAssessment(id);

  if (!assessment) {
    return jsonError("Assessment not found.", 404, "ASSESSMENT_NOT_FOUND");
  }

  if (assessment.status !== "SCORED" || !assessment.result) {
    return jsonError("Assessment has not been completed yet.", 409, "ASSESSMENT_NOT_SCORED");
  }

  return Response.json(buildReportData(assessment.id, assessment.result));
}
