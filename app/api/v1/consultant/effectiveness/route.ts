import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { learnFromInterventions } from "@/lib/execution/closed-loop-learning";

export async function GET() {
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("intervention_actions").select("*")
    .eq("organization_id", context.organizationId);
  if (error) return NextResponse.json({ error: error.message });
  const rows = Array.isArray(data) ? data : [];
  return NextResponse.json({ learning: learnFromInterventions(rows) });
}
