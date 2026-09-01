import { NextResponse } from "next/server";
import { buildExecutiveReport } from "../../../../../../lib/reports/executive";
import type { MisScoringResult } from "../../../../../../lib/mis/types";
import type { ConsultingOpportunity } from "../../../../../../lib/intelligence/opportunities";
import type { RoadmapPhase } from "../../../../../../lib/intelligence/roadmap";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as {
    clientName?: string;
    result?: MisScoringResult;
    opportunities?: ConsultingOpportunity[];
    roadmap?: RoadmapPhase[];
  };

  if (!body.clientName || !body.result || !body.opportunities || !body.roadmap) {
    return NextResponse.json({ error: "clientName, result, opportunities, and roadmap are required" }, { status: 400 });
  }

  return NextResponse.json({ assessmentId: id, report: buildExecutiveReport(body.clientName, body.result, body.opportunities, body.roadmap) });
}
