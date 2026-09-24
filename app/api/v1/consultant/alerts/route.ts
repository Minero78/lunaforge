import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { getPortfolioPredictiveIntelligence } from "@/lib/consulting/portfolio-predictive-intelligence";
import { generateExecutiveAlerts } from "@/lib/consulting/alert-engine";
import { deduplicateAlerts } from "@/lib/consulting/alert-deduplication";

type AlertRow = Record<string, unknown>;

export async function GET() {
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("executive_alerts").select("*")
    .eq("organization_id", context.organizationId).order("created_at", { ascending: false });
  return NextResponse.json(error ? { error: error.message } : { alerts: Array.isArray(data) ? data : [] });
}

export async function POST() {
  try {
    const context = await getOrganizationContext();
    const supabase = await createSupabaseServerClient();
    const portfolio = await getPortfolioPredictiveIntelligence();
    const generated = generateExecutiveAlerts(portfolio);
    const { data: existing, error: readError } = await supabase.from("executive_alerts")
      .select("*").eq("organization_id", context.organizationId);
    if (readError) throw readError;

    const existingRows: AlertRow[] = Array.isArray(existing) ? existing as AlertRow[] : [];
    const alerts = deduplicateAlerts(existingRows, generated);
    if (alerts.length) {
      const { error } = await supabase.from("executive_alerts").insert(
        alerts.map(a => ({
          organization_id: context.organizationId,
          project_id: a.projectId,
          title: a.title,
          description: a.description,
          severity: a.severity,
          payload: a.payload,
        })),
      );
      if (error) throw error;
    }
    return NextResponse.json({ generated: alerts.length, alerts });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ALERT_GENERATION_FAILED" },
      { status: 400 },
    );
  }
}
