import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { listProjectDelivery } from "@/lib/consulting/project-delivery-repository";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await listProjectDelivery(id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "PROJECT_DELIVERY_READ_FAILED" }, { status: 400 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const context = await getOrganizationContext();
    if (context.role !== "OWNER" && context.role !== "ADMIN") return NextResponse.json({ error: "ORGANIZATION_ADMIN_REQUIRED" }, { status: 403 });
    const body = await request.json() as { type?: "milestone" | "risk"; name?: string; dueDate?: string | null; status?: string; riskLevel?: string; title?: string; owner?: string; mitigation?: string; level?: string };
    const supabase = await createSupabaseServerClient();

    if (body.type === "milestone") {
      if (!body.name?.trim()) return NextResponse.json({ error: "MILESTONE_NAME_REQUIRED" }, { status: 400 });
      const result = await supabase.from<Record<string, unknown>>("project_milestones").insert({ organization_id: context.organizationId, project_id: id, name: body.name.trim(), due_date: body.dueDate ?? null, status: body.status ?? "NOT_STARTED", risk_level: body.riskLevel ?? "LOW" }).select("id, project_id, name, due_date, status, risk_level").single();
      if (result.error) throw new Error(result.error.message);
      return NextResponse.json({ milestone: result.data }, { status: 201 });
    }

    if (body.type === "risk") {
      if (!body.title?.trim()) return NextResponse.json({ error: "RISK_TITLE_REQUIRED" }, { status: 400 });
      const result = await supabase.from<Record<string, unknown>>("project_risks").insert({ organization_id: context.organizationId, project_id: id, title: body.title.trim(), owner: body.owner?.trim() || null, mitigation: body.mitigation?.trim() || null, level: body.level ?? "MEDIUM", status: "OPEN" }).select("id, project_id, title, owner, mitigation, level, status").single();
      if (result.error) throw new Error(result.error.message);
      return NextResponse.json({ risk: result.data }, { status: 201 });
    }

    return NextResponse.json({ error: "DELIVERY_TYPE_REQUIRED" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "PROJECT_DELIVERY_WRITE_FAILED" }, { status: 400 });
  }
}