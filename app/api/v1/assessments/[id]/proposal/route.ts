import { NextResponse } from "next/server";
import { assessmentRepository } from "@/lib/assessments/service";
import { deriveConsultingOpportunities } from "@/lib/intelligence/opportunities";
import { buildTransformationRoadmap } from "@/lib/intelligence/roadmap";
import { buildConsultingProposal } from "@/lib/consulting/proposal";

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

    const opportunities = deriveConsultingOpportunities(assessment.result);
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
  } catch {
    return NextResponse.json({ error: "Unable to build proposal" }, { status: 500 });
  }
}
