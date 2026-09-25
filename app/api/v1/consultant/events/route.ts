import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { buildIntelligenceEventStream } from "@/lib/consulting/intelligence-events";

type EventRow = Record<string, unknown>;

function rows(data: unknown): EventRow[] {
  return Array.isArray(data) ? data as EventRow[] : [];
}

export async function GET() {
  try {
    const context = await getOrganizationContext();
    const supabase = await createSupabaseServerClient();
    const [alerts, audits, briefs] = await Promise.all([
      supabase.from("executive_alerts").select("*").eq("organization_id", context.organizationId),
      supabase.from("copilot_decision_audits").select("*").eq("organization_id", context.organizationId),
      supabase.from("executive_briefs").select("*").eq("organization_id", context.organizationId),
    ]);
    if (alerts.error) throw alerts.error;
    if (audits.error) throw audits.error;
    if (briefs.error) throw briefs.error;

    return NextResponse.json({
      events: buildIntelligenceEventStream({
        alerts: rows(alerts.data),
        audits: rows(audits.data),
        briefs: rows(briefs.data),
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "EVENT_STREAM_FAILED" },
      { status: 400 },
    );
  }
}
