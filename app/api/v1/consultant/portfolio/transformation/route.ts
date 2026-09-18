import { NextResponse } from "next/server";
import { getPortfolioTransformationIntelligence } from "@/lib/consulting/portfolio-transformation-intelligence";

export async function GET() {
  try {
    return NextResponse.json(await getPortfolioTransformationIntelligence());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "PORTFOLIO_TRANSFORMATION_READ_FAILED" }, { status: 400 });
  }
}