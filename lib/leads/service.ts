import { createSupabaseServerClient } from "../supabase/server";
import { getOrganizationContext } from "../supabase/auth-context";
import { createLead as createMemoryLead } from "./store";
import type { StratovaLeadInput, StratovaLeadRecord } from "./types";

const useSupabase = process.env.STRATOVA_PERSISTENCE === "supabase";

type SupabaseLeadRow = {
  id: string;
  organization_id: string;
  assessment_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string;
  company: string;
  job_title: string | null;
  country: string | null;
  created_at: string;
};

export async function createLead(input: StratovaLeadInput): Promise<StratovaLeadRecord> {
  if (!useSupabase) return createMemoryLead(input);

  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from<SupabaseLeadRow>("leads")
    .upsert(
      {
        organization_id: context.organizationId,
        assessment_id: input.assessmentId,
        first_name: input.firstName,
        last_name: input.lastName ?? null,
        email: input.email.toLowerCase(),
        company: input.company,
        job_title: input.jobTitle ?? null,
        country: input.country ?? null,
      },
      { onConflict: "organization_id,email" },
    )
    .select("id, organization_id, assessment_id, first_name, last_name, email, company, job_title, country, created_at")
    .single();

  if (error || !data) throw new Error(`LEAD_CREATE_FAILED:${error?.message ?? "No lead returned."}`);

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name ?? undefined,
    email: data.email,
    company: data.company,
    jobTitle: data.job_title ?? undefined,
    country: data.country ?? undefined,
    assessmentId: data.assessment_id ?? input.assessmentId,
    createdAt: data.created_at,
  };
}
