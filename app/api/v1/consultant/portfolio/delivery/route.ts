import { NextResponse } from "next/server";
import { getPortfolioDeliveryIntelligence } from "@/lib/consulting/portfolio-delivery-intelligence";

export async function GET() {
  try {
    return NextResponse.json(await getPortfolioDeliveryIntelligence());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "PORTFOLIO_DELIVERY_READ_FAILED" }, { status: 400 });
  }
}