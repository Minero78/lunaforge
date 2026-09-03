import { jsonError } from "@/lib/api/errors";
import { syncConsultingOpportunities } from "@/lib/consulting/opportunity-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return Response.json({ opportunities: await syncConsultingOpportunities(id) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTHENTICATION_REQUIRED") return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    if (message === "ASSESSMENT_NOT_FOUND") return jsonError("Assessment not found.", 404, "ASSESSMENT_NOT_FOUND");
    if (message === "ASSESSMENT_NOT_SCORED") return jsonError("The assessment must be scored before opportunities can be synchronized.", 409, "ASSESSMENT_NOT_SCORED");
    return jsonError("Unable to synchronize consulting opportunities.", 500, "CONSULTING_OPPORTUNITIES_SYNC_FAILED");
  }
}
