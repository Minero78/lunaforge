import { createSupabaseServerClient } from "./server";

export async function getCurrentUserOrganizationId(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("AUTHENTICATION_REQUIRED");

  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`ORGANIZATION_LOOKUP_FAILED:${error.message}`);
  if (!data) throw new Error("ORGANIZATION_CONTEXT_REQUIRED");

  return data.organization_id;
}
