import { NextResponse } from "next/server";
import { getPortfolioPredictiveIntelligence } from "@/lib/consulting/portfolio-predictive-intelligence";

export async function GET() {
  try {
    return NextResponse.json(await getPortfolioPredictiveIntelligence());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "PORTFOLIO_PREDICTIVE_READ_FAILED" }, { status: 400 });
  }
}