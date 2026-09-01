import { createSupabaseServerClient } from "./server";

export type OrganizationContext = {
  userId: string;
  organizationId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
};

export async function getOrganizationContext(): Promise<OrganizationContext> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("AUTHENTICATION_REQUIRED");

  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`ORGANIZATION_LOOKUP_FAILED:${error.message}`);
  if (!data) throw new Error("ORGANIZATION_CONTEXT_REQUIRED");

  return {
    userId: user.id,
    organizationId: data.organization_id,
    role: data.role,
  };
}

export async function getCurrentUserOrganizationId(): Promise<string> {
  const context = await getOrganizationContext();
  return context.organizationId;
}
