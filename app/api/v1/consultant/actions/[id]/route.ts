import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { escalateSeverity } from "@/lib/execution/escalation-engine";

type InterventionAction = { severity: string };

export async function PATCH(r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await r.json() as { escalate?: boolean; reason?: string; [key: string]: unknown };
    const context = await getOrganizationContext();
    const supabase = await createSupabaseServerClient();

    const { data: current, error: readError } = await supabase
      .from("intervention_actions").select("*").eq("id", id)
      .eq("organization_id", context.organizationId).maybeSingle();

    if (readError) throw readError;
    if (!current) return NextResponse.json({ error: "ACTION_NOT_FOUND" }, { status: 404 });

    const typedCurrent = current as InterventionAction;
    const patch: Record<string, unknown> = { ...body, updated_at: new Date().toISOString() };
    delete patch.escalate;
    delete patch.reason;

    if (body.escalate) {
      patch.severity = escalateSeverity(
        typedCurrent.severity,
        body.reason ?? "Manual escalation",
      ).next;
    }

    const { data, error } = await supabase.from("intervention_actions")
      .update(patch).eq("id", id).eq("organization_id", context.organizationId)
      .select().single();

    if (error) throw error;
    return NextResponse.json({ action: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ACTION_UPDATE_FAILED" },
      { status: 400 },
    );
  }
}
