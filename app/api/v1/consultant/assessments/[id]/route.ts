import { jsonError } from "@/lib/api/errors";
import { assessmentRepository } from "@/lib/assessments/service";
import { buildConsultantWorkspace } from "@/lib/consulting/workspace";
import { syncConsultingOpportunities } from "@/lib/consulting/opportunity-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const assessment = await assessmentRepository.getAssessment(id);
    if (!assessment) return jsonError("Assessment not found.", 404, "ASSESSMENT_NOT_FOUND");
    const opportunities = assessment.status === "SCORED" && assessment.result
      ? await syncConsultingOpportunities(id)
      : undefined;
    return Response.json({ workspace: buildConsultantWorkspace(assessment, opportunities) });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    return jsonError("Unable to load consultant assessment.", 500, "CONSULTANT_ASSESSMENT_READ_FAILED");
  }
}
