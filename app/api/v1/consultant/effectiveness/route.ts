import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { learnFromInterventions } from "@/lib/execution/closed-loop-learning";

type InterventionRow = Record<string, unknown>;

export async function GET() {
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("intervention_actions").select("*")
    .eq("organization_id", context.organizationId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows: InterventionRow[] = Array.isArray(data) ? (data as InterventionRow[]) : [];
  return NextResponse.json({ learning: learnFromInterventions(rows) });
}
