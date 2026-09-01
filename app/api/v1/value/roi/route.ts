import { NextResponse } from "next/server";
import { calculateRoi } from "../../../../../lib/value/roi";

export async function POST(request: Request) {
  const body = await request.json();
  const { investment, expectedAnnualBenefit, actualAnnualBenefit, currency } = body ?? {};

  if (typeof investment !== "number" || typeof expectedAnnualBenefit !== "number" || investment < 0 || expectedAnnualBenefit < 0) {
    return NextResponse.json({ error: "investment and expectedAnnualBenefit must be non-negative numbers" }, { status: 400 });
  }
  if (actualAnnualBenefit !== undefined && (typeof actualAnnualBenefit !== "number" || actualAnnualBenefit < 0)) {
    return NextResponse.json({ error: "actualAnnualBenefit must be a non-negative number" }, { status: 400 });
  }

  return NextResponse.json({ roi: calculateRoi({ investment, expectedAnnualBenefit, actualAnnualBenefit, currency }) });
}
