import { jsonError } from "@/lib/api/errors";
import { updateConsultingOpportunity } from "@/lib/consulting/opportunity-repository";
import type { CommercialOpportunity } from "@/lib/consulting/opportunity";

const stages = new Set<CommercialOpportunity["stage"]>(["IDENTIFIED", "QUALIFIED", "PROPOSED", "WON", "LOST"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json() as { stage?: string; estimatedValue?: unknown; currency?: unknown };
    const stage = body.stage === undefined ? undefined : body.stage.toUpperCase();
    if (stage !== undefined && !stages.has(stage as CommercialOpportunity["stage"])) {
      return jsonError("Invalid opportunity stage.", 400, "INVALID_OPPORTUNITY_STAGE");
    }
    if (body.estimatedValue !== undefined && body.estimatedValue !== null &&
      (typeof body.estimatedValue !== "number" || !Number.isFinite(body.estimatedValue) || body.estimatedValue < 0)) {
      return jsonError("estimatedValue must be a non-negative number or null.", 400, "INVALID_ESTIMATED_VALUE");
    }
    if (body.currency !== undefined && body.currency !== null &&
      (typeof body.currency !== "string" || !/^[A-Za-z]{3}$/.test(body.currency))) {
      return jsonError("currency must be a three-letter code or null.", 400, "INVALID_CURRENCY");
    }

    const opportunity = await updateConsultingOpportunity(id, {
      stage: stage as CommercialOpportunity["stage"] | undefined,
      estimatedValue: body.estimatedValue as number | null | undefined,
      currency: typeof body.currency === "string" ? body.currency.toUpperCase() : body.currency as null | undefined,
    });
    return Response.json({ opportunity });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTHENTICATION_REQUIRED") return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    if (message === "ORGANIZATION_ADMIN_REQUIRED") return jsonError("Organization admin access is required.", 403, "ORGANIZATION_ADMIN_REQUIRED");
    if (message === "CONSULTING_OPPORTUNITY_NOT_FOUND") return jsonError("Opportunity not found.", 404, "CONSULTING_OPPORTUNITY_NOT_FOUND");
    if (message === "INVALID_OPPORTUNITY_STAGE_TRANSITION") return jsonError("Invalid opportunity stage transition.", 409, "INVALID_OPPORTUNITY_STAGE_TRANSITION");
    if (message === "NO_OPPORTUNITY_CHANGES") return jsonError("No changes supplied.", 400, "NO_OPPORTUNITY_CHANGES");
    return jsonError("Unable to update consulting opportunity.", 500, "CONSULTING_OPPORTUNITY_WRITE_FAILED");
  }
}
