import { NextResponse } from "next/server";
import { buildConsultingProposal } from "../../../../../../lib/consulting/proposal";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as {
    clientName?: string;
    opportunities?: Parameters<typeof buildConsultingProposal>[0]["opportunities"];
    roadmap?: Parameters<typeof buildConsultingProposal>[0]["roadmap"];
    currency?: string;
  };

  if (!body.clientName || !body.opportunities || !body.roadmap) {
    return NextResponse.json({ error: "clientName, opportunities, and roadmap are required" }, { status: 400 });
  }

  return NextResponse.json({ assessmentId: id, proposal: buildConsultingProposal({
    clientName: body.clientName,
    opportunities: body.opportunities,
    roadmap: body.roadmap,
    currency: body.currency,
  }) });
}
