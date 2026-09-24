import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { canTransitionAlert, type AlertStatus } from "@/lib/consulting/alert-lifecycle";

type ExecutiveAlert = { status: AlertStatus };

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json() as { status?: AlertStatus };
    const status = body.status;
    if (!status) return NextResponse.json({ error: "ALERT_STATUS_REQUIRED" }, { status: 400 });

    const context = await getOrganizationContext();
    const supabase = await createSupabaseServerClient();
    const { data: current, error: readError } = await supabase
      .from("executive_alerts").select("*").eq("id", id)
      .eq("organization_id", context.organizationId).maybeSingle();

    if (readError) throw readError;
    if (!current) return NextResponse.json({ error: "ALERT_NOT_FOUND" }, { status: 404 });

    const typedCurrent = current as ExecutiveAlert;
    if (!canTransitionAlert(typedCurrent.status, status)) {
      return NextResponse.json({ error: "INVALID_ALERT_TRANSITION" }, { status: 400 });
    }

    const patch: Record<string, unknown> = { status };
    if (status === "ACKNOWLEDGED") patch.acknowledged_at = new Date().toISOString();

    const { data, error } = await supabase.from("executive_alerts")
      .update(patch).eq("id", id).eq("organization_id", context.organizationId)
      .select().single();

    if (error) throw error;
    return NextResponse.json({ alert: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ALERT_UPDATE_FAILED" },
      { status: 400 },
    );
  }
}
