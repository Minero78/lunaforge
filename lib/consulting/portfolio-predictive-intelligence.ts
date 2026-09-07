import { getPortfolioTransformationIntelligence } from "@/lib/consulting/portfolio-transformation-intelligence";
import { calculateTransformationSignals } from "@/lib/consulting/transformation-signals";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

export async function getPortfolioPredictiveIntelligence() {
  const portfolio = await getPortfolioTransformationIntelligence();
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();

  const [milestonesResult, risksResult, outcomesResult] = await Promise.all([
    supabase.from<Record<string, unknown>>("project_milestones").select("project_id, status").eq("organization_id", context.organizationId),
    supabase.from<Record<string, unknown>>("project_risks").select("project_id, level, status").eq("organization_id", context.organizationId),
    supabase.from<Record<string, unknown>>("project_outcomes").select("project_id, status").eq("organization_id", context.organizationId),
  ]);

  const milestones = (milestonesResult.data ?? []) as Record<string, unknown>[];
  const risks = (risksResult.data ?? []) as Record<string, unknown>[];
  const outcomes = (outcomesResult.data ?? []) as Record<string, unknown>[];

  const projects = portfolio.projects.map((project) => {
    const projectMilestones = milestones.filter((row) => String(row.project_id) === project.id);
    const projectRisks = risks.filter((row) => String(row.project_id) === project.id);
    const projectOutcomes = outcomes.filter((row) => String(row.project_id) === project.id);
    const completedMilestones = projectMilestones.filter((row) => row.status === "DONE").length;
    const achievedOutcomes = projectOutcomes.filter((row) => row.status === "ACHIEVED" || row.status === "DONE").length;
    const signals = calculateTransformationSignals({
      deliveryHealth: project.deliveryHealth,
      outcomeHealth: project.outcomeHealth,
      overdueMilestones: 0,
      highOpenRisks: projectRisks.filter((row) => row.level === "HIGH" && row.status !== "CLOSED").length,
      totalMilestones: projectMilestones.length,
      completedMilestones,
      totalOutcomes: projectOutcomes.length,
      achievedOutcomes,
    });
    return { ...project, predictiveRiskScore: signals.score, predictiveRiskLevel: signals.level, trend: signals.trend, signals: signals.signals };
  });

  projects.sort((a, b) => b.predictiveRiskScore - a.predictiveRiskScore);

  return {
    projects,
    summary: {
      totalProjects: projects.length,
      critical: projects.filter((project) => project.predictiveRiskLevel === "CRITICAL").length,
      high: projects.filter((project) => project.predictiveRiskLevel === "HIGH").length,
      moderate: projects.filter((project) => project.predictiveRiskLevel === "MODERATE").length,
      low: projects.filter((project) => project.predictiveRiskLevel === "LOW").length,
      deteriorating: projects.filter((project) => project.trend === "DETERIORATING").length,
    },
  };
}