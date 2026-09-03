import { jsonError } from "@/lib/api/errors";
import { listConsultingOpportunities } from "@/lib/consulting/opportunity-repository";

export async function GET(request: Request) {
  try {
    const assessmentId = new URL(request.url).searchParams.get("assessmentId") ?? undefined;
    return Response.json({ opportunities: await listConsultingOpportunities(assessmentId) });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    return jsonError("Unable to load consulting opportunities.", 500, "CONSULTING_OPPORTUNITIES_READ_FAILED");
  }
}
