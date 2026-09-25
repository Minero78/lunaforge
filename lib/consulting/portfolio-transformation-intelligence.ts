import { getPortfolioDeliveryIntelligence } from "@/lib/consulting/portfolio-delivery-intelligence";
import { calculateOutcomeHealth, calculateTransformationHealth, type OutcomeHealth, type TransformationStatus } from "@/lib/consulting/transformation-health";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

export type PortfolioTransformationProject = {
  id: string;
  name: string;
  deliveryHealth: string;
  outcomeHealth: OutcomeHealth;
  transformationStatus: TransformationStatus;
  deliveryProgress: number;
  outcomeProgress: number;
};

export async function getPortfolioTransformationIntelligence() {
  const deliveryPortfolio = await getPortfolioDeliveryIntelligence();
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();

  const outcomesResult = await supabase
    .from<Record<string, unknown>>("project_outcomes")
    .select("project_id, status")
    .eq("organization_id", context.organizationId);

  const outcomeRows = outcomesResult.error ? [] : (outcomesResult.data ?? []) as Record<string, unknown>[];

  const projects: PortfolioTransformationProject[] = deliveryPortfolio.projects.map((project) => {
    const rows = outcomeRows.filter((row) => String(row.project_id) === project.id);
    const achieved = rows.filter((row) => row.status === "ACHIEVED" || row.status === "DONE").length;
    const offTarget = rows.filter((row) => row.status === "OFF_TARGET").length;
    const watch = rows.filter((row) => row.status === "WATCH" || row.status === "AT_RISK").length;
    const outcome = calculateOutcomeHealth({ totalOutcomes: rows.length, achievedOutcomes: achieved, offTargetOutcomes: offTarget, watchOutcomes: watch });
    return {
      id: project.id,
      name: project.name,
      deliveryHealth: project.deliveryHealth,
      outcomeHealth: outcome.health,
      transformationStatus: calculateTransformationHealth(project.deliveryHealth, outcome.health),
      deliveryProgress: project.progress,
      outcomeProgress: outcome.progress,
    };
  });

  const summary = {
    totalProjects: projects.length,
    healthy: projects.filter((project) => project.transformationStatus === "HEALTHY").length,
    deliveryIntervention: projects.filter((project) => project.transformationStatus === "DELIVERY_INTERVENTION").length,
    valueIntervention: projects.filter((project) => project.transformationStatus === "VALUE_INTERVENTION").length,
    executiveEscalation: projects.filter((project) => project.transformationStatus === "EXECUTIVE_ESCALATION").length,
    complete: projects.filter((project) => project.transformationStatus === "COMPLETE").length,
  };

  return { projects, summary };
}