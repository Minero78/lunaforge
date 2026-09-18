import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { listProjectDelivery } from "@/lib/consulting/project-delivery-repository";

const milestoneStatuses = ["NOT_STARTED", "IN_PROGRESS", "DONE"] as const;
const riskLevels = ["LOW", "MEDIUM", "HIGH"] as const;
const riskStatuses = ["OPEN", "MITIGATING", "CLOSED"] as const;

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const { id } = await params; return NextResponse.json(await listProjectDelivery(id)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "PROJECT_DELIVERY_READ_FAILED" }, { status: 400 }); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const context = await getOrganizationContext();
    if (context.role !== "OWNER" && context.role !== "ADMIN") return NextResponse.json({ error: "ORGANIZATION_ADMIN_REQUIRED" }, { status: 403 });
    const body = await request.json() as { type?: "milestone" | "risk"; name?: string; dueDate?: string | null; status?: string; riskLevel?: string; title?: string; owner?: string; mitigation?: string; level?: string };
    const supabase = await createSupabaseServerClient();
    if (body.type === "milestone") {
      if (!body.name?.trim()) return NextResponse.json({ error: "MILESTONE_NAME_REQUIRED" }, { status: 400 });
      const status = milestoneStatuses.includes(body.status as typeof milestoneStatuses[number]) ? body.status : "NOT_STARTED";
      const riskLevel = riskLevels.includes(body.riskLevel as typeof riskLevels[number]) ? body.riskLevel : "LOW";
      const result = await supabase.from<Record<string, unknown>>("project_milestones").insert({ organization_id: context.organizationId, project_id: id, name: body.name.trim(), due_date: body.dueDate ?? null, status, risk_level: riskLevel }).select("id, project_id, name, due_date, status, risk_level").single();
      if (result.error) throw new Error(result.error.message); return NextResponse.json({ milestone: result.data }, { status: 201 });
    }
    if (body.type === "risk") {
      if (!body.title?.trim()) return NextResponse.json({ error: "RISK_TITLE_REQUIRED" }, { status: 400 });
      const level = riskLevels.includes(body.level as typeof riskLevels[number]) ? body.level : "MEDIUM";
      const result = await supabase.from<Record<string, unknown>>("project_risks").insert({ organization_id: context.organizationId, project_id: id, title: body.title.trim(), owner: body.owner?.trim() || null, mitigation: body.mitigation?.trim() || null, level, status: "OPEN" }).select("id, project_id, title, owner, mitigation, level, status").single();
      if (result.error) throw new Error(result.error.message); return NextResponse.json({ risk: result.data }, { status: 201 });
    }
    return NextResponse.json({ error: "DELIVERY_TYPE_REQUIRED" }, { status: 400 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "PROJECT_DELIVERY_WRITE_FAILED" }, { status: 400 }); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; const context = await getOrganizationContext();
    if (context.role !== "OWNER" && context.role !== "ADMIN") return NextResponse.json({ error: "ORGANIZATION_ADMIN_REQUIRED" }, { status: 403 });
    const body = await request.json() as { type?: "milestone" | "risk"; itemId?: string; status?: string; dueDate?: string | null; riskLevel?: string; level?: string; owner?: string | null; mitigation?: string | null };
    if (!body.type || !body.itemId) return NextResponse.json({ error: "DELIVERY_ITEM_REQUIRED" }, { status: 400 });
    const supabase = await createSupabaseServerClient();
    if (body.type === "milestone") {
      const patch: Record<string, unknown> = {};
      if (body.status && milestoneStatuses.includes(body.status as typeof milestoneStatuses[number])) patch.status = body.status;
      if (body.dueDate !== undefined) patch.due_date = body.dueDate;
      if (body.riskLevel && riskLevels.includes(body.riskLevel as typeof riskLevels[number])) patch.risk_level = body.riskLevel;
      if (!Object.keys(patch).length) return NextResponse.json({ error: "NO_MILESTONE_CHANGES" }, { status: 400 });
      const result = await supabase.from<Record<string, unknown>>("project_milestones").update(patch).eq("id", body.itemId).eq("project_id", id).eq("organization_id", context.organizationId).select("id, project_id, name, due_date, status, risk_level").single();
      if (result.error) throw new Error(result.error.message); return NextResponse.json({ milestone: result.data });
    }
    if (body.type === "risk") {
      const patch: Record<string, unknown> = {};
      if (body.status && riskStatuses.includes(body.status as typeof riskStatuses[number])) patch.status = body.status;
      if (body.level && riskLevels.includes(body.level as typeof riskLevels[number])) patch.level = body.level;
      if (body.owner !== undefined) patch.owner = body.owner;
      if (body.mitigation !== undefined) patch.mitigation = body.mitigation;
      if (!Object.keys(patch).length) return NextResponse.json({ error: "NO_RISK_CHANGES" }, { status: 400 });
      const result = await supabase.from<Record<string, unknown>>("project_risks").update(patch).eq("id", body.itemId).eq("project_id", id).eq("organization_id", context.organizationId).select("id, project_id, title, owner, mitigation, level, status").single();
      if (result.error) throw new Error(result.error.message); return NextResponse.json({ risk: result.data });
    }
    return NextResponse.json({ error: "INVALID_DELIVERY_TYPE" }, { status: 400 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "PROJECT_DELIVERY_UPDATE_FAILED" }, { status: 400 }); }
}