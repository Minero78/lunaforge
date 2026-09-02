import { jsonError } from "@/lib/api/errors";
import { createProjectFromWonOpportunity, listConsultingProjects } from "@/lib/consulting/project-repository";

export async function GET() {
  try {
    return Response.json({ projects: await listConsultingProjects() });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    return jsonError("Unable to load consulting projects.", 500, "PROJECT_READ_FAILED");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      opportunityId?: unknown; name?: unknown; startDate?: unknown; targetEndDate?: unknown;
      contractValue?: unknown; currency?: unknown;
    };
    if (typeof body.opportunityId !== "string" || !body.opportunityId) return jsonError("opportunityId is required.", 400, "OPPORTUNITY_ID_REQUIRED");
    if (typeof body.name !== "string" || !body.name.trim()) return jsonError("name is required.", 400, "PROJECT_NAME_REQUIRED");
    if (body.contractValue !== undefined && body.contractValue !== null &&
      (typeof body.contractValue !== "number" || !Number.isFinite(body.contractValue) || body.contractValue < 0)) {
      return jsonError("contractValue must be a non-negative number or null.", 400, "INVALID_CONTRACT_VALUE");
    }
    if (body.currency !== undefined && body.currency !== null &&
      (typeof body.currency !== "string" || !/^[A-Za-z]{3}$/.test(body.currency))) {
      return jsonError("currency must be a three-letter code or null.", 400, "INVALID_CURRENCY");
    }

    const project = await createProjectFromWonOpportunity({
      opportunityId: body.opportunityId,
      name: body.name,
      startDate: body.startDate == null ? null : String(body.startDate),
      targetEndDate: body.targetEndDate == null ? null : String(body.targetEndDate),
      contractValue: body.contractValue as number | null | undefined,
      currency: body.currency == null ? null : String(body.currency),
    });
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTHENTICATION_REQUIRED") return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    if (message === "ORGANIZATION_ADMIN_REQUIRED") return jsonError("Organization admin access is required.", 403, "ORGANIZATION_ADMIN_REQUIRED");
    if (message === "CONSULTING_OPPORTUNITY_NOT_FOUND") return jsonError("Opportunity not found.", 404, "CONSULTING_OPPORTUNITY_NOT_FOUND");
    if (message === "PROJECT_REQUIRES_WON_OPPORTUNITY") return jsonError("Only won opportunities can become projects.", 409, "PROJECT_REQUIRES_WON_OPPORTUNITY");
    if (message === "PROJECT_NAME_REQUIRED") return jsonError("Project name is required.", 400, "PROJECT_NAME_REQUIRED");
    return jsonError("Unable to create consulting project.", 500, "PROJECT_CREATE_FAILED");
  }
}
