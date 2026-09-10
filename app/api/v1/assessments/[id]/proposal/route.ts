import { NextResponse } from "next/server";
import { assessmentRepository } from "@/lib/assessments/service";
import { buildConsultingProposal } from "@/lib/consulting/proposal";
import { syncConsultingOpportunities } from "@/lib/consulting/opportunity-service";
import { buildTransformationRoadmap } from "@/lib/intelligence/roadmap";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: { clientName?: string; currency?: string };
  try {
    body = (await request.json()) as { clientName?: string; currency?: string };
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (!body.clientName?.trim()) {
    return NextResponse.json({ error: "clientName is required" }, { status: 400 });
  }

  try {
    const assessment = await assessmentRepository.getAssessment(id);
    if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    if (assessment.status !== "SCORED" || !assessment.result) {
      return NextResponse.json({ error: "Assessment has not been completed" }, { status: 409 });
    }

    const opportunities = await syncConsultingOpportunities(id);
    const roadmap = buildTransformationRoadmap(opportunities);
    return NextResponse.json({
      assessmentId: id,
      proposal: buildConsultingProposal({
        clientName: body.clientName.trim(),
        opportunities,
        roadmap,
        currency: body.currency,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    return NextResponse.json({ error: "Unable to build proposal" }, { status: 500 });
  }
}
