import { NextResponse } from "next/server";
import { calculateRoi } from "../../../../../lib/value/roi";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { opportunityId, investment, expectedAnnualBenefit, actualAnnualBenefit, currency } = body ?? {};

    if (typeof opportunityId !== "string" || !opportunityId) {
      return NextResponse.json({ error: "opportunityId is required" }, { status: 400 });
    }
    if (typeof investment !== "number" || typeof expectedAnnualBenefit !== "number" || investment <= 0 || expectedAnnualBenefit < 0) {
      return NextResponse.json({ error: "investment must be greater than zero and expectedAnnualBenefit must be non-negative" }, { status: 400 });
    }
    if (actualAnnualBenefit !== undefined && (typeof actualAnnualBenefit !== "number" || actualAnnualBenefit < 0)) {
      return NextResponse.json({ error: "actualAnnualBenefit must be a non-negative number" }, { status: 400 });
    }
    if (currency !== undefined && currency !== null && (typeof currency !== "string" || !/^[A-Za-z]{3}$/.test(currency))) {
      return NextResponse.json({ error: "currency must be a three-letter code or null" }, { status: 400 });
    }

    const context = await getOrganizationContext();
    if (context.role !== "OWNER" && context.role !== "ADMIN") {
      return NextResponse.json({ error: "Organization admin access is required" }, { status: 403 });
    }

    const supabase = await createSupabaseServerClient();
    const opportunity = await supabase
      .from<Record<string, unknown>>("consulting_opportunities")
      .select("id, organization_id")
      .eq("id", opportunityId)
      .eq("organization_id", context.organizationId)
      .maybeSingle();
    if (opportunity.error) throw new Error(`OPPORTUNITY_READ_FAILED:${opportunity.error.message}`);
    if (!opportunity.data) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

    const roi = calculateRoi({ investment, expectedAnnualBenefit, actualAnnualBenefit, currency });
    const saved = await supabase
      .from<Record<string, unknown>>("opportunity_value_cases")
      .upsert({
        organization_id: context.organizationId,
        opportunity_id: opportunityId,
        investment,
        expected_annual_benefit: expectedAnnualBenefit,
        actual_annual_benefit: actualAnnualBenefit ?? null,
        currency: roi.currency,
        roi_percent: roi.expectedRoiPercent,
        payback_months: roi.expectedPaybackMonths,
      }, { onConflict: "organization_id,opportunity_id" })
      .select("id, opportunity_id, investment, expected_annual_benefit, actual_annual_benefit, currency, roi_percent, payback_months, created_at, updated_at")
      .single();
    if (saved.error) throw new Error(`VALUE_CASE_WRITE_FAILED:${saved.error.message}`);

    return NextResponse.json({ roi, valueCase: saved.data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    if (message === "ORGANIZATION_CONTEXT_REQUIRED") return NextResponse.json({ error: "Organization context is required" }, { status: 403 });
    return NextResponse.json({ error: "Unable to calculate or persist ROI" }, { status: 500 });
  }
}
