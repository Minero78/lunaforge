import { jsonError } from "@/lib/api/errors";
import { assessmentRepository } from "@/lib/assessments/service";
import { buildReportData } from "@/lib/reports/builder";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const assessment = await assessmentRepository.getAssessment(id);

    if (!assessment) {
      return jsonError("Assessment not found.", 404, "ASSESSMENT_NOT_FOUND");
    }

    if (assessment.status !== "SCORED" || !assessment.result) {
      return jsonError("Assessment has not been completed yet.", 409, "ASSESSMENT_NOT_SCORED");
    }

    return Response.json(buildReportData(assessment.id, assessment.result));
  } catch {
    return jsonError("Unable to load assessment report.", 500, "ASSESSMENT_REPORT_ERROR");
  }
}
