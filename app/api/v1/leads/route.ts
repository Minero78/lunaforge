import { jsonError } from "../../../../lib/api/errors";
import { assessmentRepository } from "../../../../lib/assessments/service";
import { createLead } from "../../../../lib/leads/service";
import type { StratovaLeadInput } from "../../../../lib/leads/types";

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON.", 400, "INVALID_JSON");
  }

  if (!body || typeof body !== "object") {
    return jsonError("A lead payload is required.", 400, "LEAD_REQUIRED");
  }

  const payload = body as Partial<StratovaLeadInput>;

  if (!nonEmptyString(payload.firstName) || !nonEmptyString(payload.email) || !nonEmptyString(payload.company) || !nonEmptyString(payload.assessmentId)) {
    return jsonError("First name, business email, company, and assessment are required.", 400, "REQUIRED_FIELDS");
  }

  if (!isEmail(payload.email)) {
    return jsonError("A valid business email is required.", 400, "INVALID_EMAIL");
  }

  try {
    const assessment = await assessmentRepository.getAssessment(payload.assessmentId);
    if (!assessment || assessment.status !== "SCORED" || !assessment.result) {
      return jsonError("A completed assessment is required.", 409, "ASSESSMENT_NOT_SCORED");
    }

    const lead = await createLead({
      firstName: payload.firstName.trim(),
      lastName: nonEmptyString(payload.lastName) ? payload.lastName.trim() : undefined,
      email: payload.email.trim().toLowerCase(),
      company: payload.company.trim(),
      jobTitle: nonEmptyString(payload.jobTitle) ? payload.jobTitle.trim() : undefined,
      country: nonEmptyString(payload.country) ? payload.country.trim() : undefined,
      assessmentId: payload.assessmentId,
    });

    return Response.json({
      id: lead.id,
      assessmentId: lead.assessmentId,
      status: "ASSESSED",
      createdAt: lead.createdAt,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") {
      return jsonError("Authentication is required.", 401, "AUTHENTICATION_REQUIRED");
    }
    if (error instanceof Error && error.message === "ORGANIZATION_CONTEXT_REQUIRED") {
      return jsonError("An organization is required.", 409, "ORGANIZATION_CONTEXT_REQUIRED");
    }
    if (error instanceof Error && error.message.startsWith("LEAD_CREATE_FAILED:")) {
      return jsonError("Unable to persist lead.", 500, "LEAD_CREATE_FAILED");
    }
    return jsonError("Unable to create lead.", 500, "LEAD_CREATE_FAILED");
  }
}
