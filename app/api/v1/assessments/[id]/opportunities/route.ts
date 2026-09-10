import { jsonError } from "@/lib/api/errors";
import { assessmentRepository } from "@/lib/assessments/service";
import { deriveConsultingOpportunities } from "@/lib/intelligence/opportunities";

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const assessment = await assessmentRepository.getAssessment(id);
    if (!assessment) return jsonError("Assessment not found.", 404, "ASSESSMENT_NOT_FOUND");
    if (!assessment.result) return jsonError("Assessment has not been scored yet.", 409, "ASSESSMENT_NOT_SCORED");
    return Response.json({ assessmentId: id, opportunities: deriveConsultingOpportunities(assessment.result) });
  } catch {
    return jsonError("Unable to derive consulting opportunities.", 500, "OPPORTUNITY_ENGINE_ERROR");
  }
}
