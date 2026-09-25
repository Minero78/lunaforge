import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { isInterventionActionStatus } from "@/lib/consulting/intervention-actions";

export async function GET(request: NextRequest) {
  try {
    const context = await getOrganizationContext();
    const projectId = request.nextUrl.searchParams.get("projectId");
    const supabase = await createSupabaseServerClient();
    let query = supabase.from("intervention_actions").select("*").eq("organization_id", context.organizationId).order("created_at", { ascending: false });
    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ actions: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "INTERVENTION_ACTIONS_READ_FAILED" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const context = await getOrganizationContext();
    if (!body.projectId || !body.title) return NextResponse.json({ error: "PROJECT_ID_AND_TITLE_REQUIRED" }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("intervention_actions").insert({
      organization_id: context.organizationId,
      project_id: body.projectId,
      title: body.title,
      description: body.description ?? null,
      recommended_owner: body.recommendedOwner ?? null,
      assigned_to: body.assignedTo ?? null,
      urgency: body.urgency ?? "MEDIUM",
      status: "RECOMMENDED",
      baseline_risk_score: body.baselineRiskScore ?? null,
      baseline_delivery_health: body.baselineDeliveryHealth ?? null,
      baseline_outcome_health: body.baselineOutcomeHealth ?? null,
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ action: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "INTERVENTION_ACTION_CREATE_FAILED" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id || !isInterventionActionStatus(body.status)) return NextResponse.json({ error: "INVALID_ACTION_UPDATE" }, { status: 400 });

    const context = await getOrganizationContext();
    const supabase = await createSupabaseServerClient();
    const patch: Record<string, unknown> = { status: body.status };
    if (typeof body.assignedTo === "string") patch.assigned_to = body.assignedTo;

    const now = new Date().toISOString();
    if (body.status === "ACCEPTED") patch.accepted_at = now;
    if (body.status === "IN_PROGRESS") patch.started_at = now;
    if (body.status === "COMPLETED") patch.completed_at = now;

    const { data, error } = await supabase.from("intervention_actions").update(patch).eq("id", body.id).eq("organization_id", context.organizationId).select().single();
    if (error) throw error;
    return NextResponse.json({ action: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "INTERVENTION_ACTION_UPDATE_FAILED" }, { status: 400 });
  }
}