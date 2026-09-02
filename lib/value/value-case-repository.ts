import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

export type ValueCase = {
  id: string;
  organizationId: string;
  opportunityId: string;
  investment: number;
  expectedAnnualBenefit: number;
  actualAnnualBenefit?: number;
  currency: string;
  expectedRoiPercent: number;
  expectedPaybackMonths: number | null;
  actualRoiPercent?: number;
  actualPaybackMonths?: number | null;
  createdAt: string;
  updatedAt: string;
};

const columns = "id, organization_id, opportunity_id, investment, expected_annual_benefit, actual_annual_benefit, currency, roi_percent, payback_months, actual_roi_percent, actual_payback_months, created_at, updated_at";

export async function getValueCase(opportunityId: string): Promise<ValueCase | null> {
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from<Record<string, unknown>>("opportunity_value_cases")
    .select(columns)
    .eq("organization_id", context.organizationId)
    .eq("opportunity_id", opportunityId)
    .maybeSingle();
  if (result.error) throw new Error(`VALUE_CASE_READ_FAILED:${result.error.message}`);
  return result.data ? mapValueCase(result.data) : null;
}

export async function listValueCases(): Promise<ValueCase[]> {
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from<Record<string, unknown>>("opportunity_value_cases")
    .select(columns)
    .eq("organization_id", context.organizationId)
    .order("updated_at", { ascending: false });
  if (result.error) throw new Error(`VALUE_CASE_READ_FAILED:${result.error.message}`);
  return (result.data ?? []).map(mapValueCase);
}

function mapValueCase(row: Record<string, unknown>): ValueCase {
  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    opportunityId: String(row.opportunity_id),
    investment: Number(row.investment),
    expectedAnnualBenefit: Number(row.expected_annual_benefit),
    actualAnnualBenefit: row.actual_annual_benefit == null ? undefined : Number(row.actual_annual_benefit),
    currency: String(row.currency),
    expectedRoiPercent: Number(row.roi_percent),
    expectedPaybackMonths: row.payback_months == null ? null : Number(row.payback_months),
    actualRoiPercent: row.actual_roi_percent == null ? undefined : Number(row.actual_roi_percent),
    actualPaybackMonths: row.actual_payback_months == null ? null : Number(row.actual_payback_months),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
