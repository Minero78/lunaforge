import { NextResponse } from "next/server";
import { getValueCase, listValueCases } from "@/lib/value/value-case-repository";

export async function GET(request: Request) {
  try {
    const opportunityId = new URL(request.url).searchParams.get("opportunityId");
    if (opportunityId) {
      const valueCase = await getValueCase(opportunityId);
      if (!valueCase) return NextResponse.json({ error: "Value case not found" }, { status: 404 });
      return NextResponse.json({ valueCase });
    }
    return NextResponse.json({ valueCases: await listValueCases() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
    if (message === "ORGANIZATION_CONTEXT_REQUIRED") return NextResponse.json({ error: "Organization context is required" }, { status: 403 });
    return NextResponse.json({ error: "Unable to load value realization" }, { status: 500 });
  }
}
