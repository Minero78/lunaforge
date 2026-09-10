import { jsonError } from "@/lib/api/errors";
import { assessmentRepository } from "@/lib/assessments/service";
import { deriveConsultingOpportunities } from "@/lib/intelligence/opportunities";
import { buildTransformationRoadmap } from "@/lib/intelligence/roadmap";

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const assessment = await assessmentRepository.getAssessment(id);
    if (!assessment) return jsonError("Assessment not found.", 404, "ASSESSMENT_NOT_FOUND");
    if (!assessment.result) return jsonError("Assessment has not been scored yet.", 409, "ASSESSMENT_NOT_SCORED");
    const opportunities = deriveConsultingOpportunities(assessment.result);
    return Response.json({ assessmentId: id, roadmap: buildTransformationRoadmap(opportunities), opportunities });
  } catch {
    return jsonError("Unable to build transformation roadmap.", 500, "ROADMAP_ENGINE_ERROR");
  }
}
