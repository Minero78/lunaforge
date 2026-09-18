import { getPortfolioTransformationIntelligence } from "@/lib/consulting/portfolio-transformation-intelligence";
import { calculateTransformationSignals } from "@/lib/consulting/transformation-signals";
import { calculateInterventionPriority, getRecommendedActions } from "@/lib/consulting/intervention-playbooks";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";

export async function getPortfolioPredictiveIntelligence() {
  const portfolio = await getPortfolioTransformationIntelligence();
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();

  const [milestonesResult, risksResult, outcomesResult] = await Promise.all([
    supabase.from<Record<string, unknown>>("project_milestones").select("project_id, status, due_date").eq("organization_id", context.organizationId),
    supabase.from<Record<string, unknown>>("project_risks").select("project_id, level, status").eq("organization_id", context.organizationId),
    supabase.from<Record<string, unknown>>("project_outcomes").select("project_id, status").eq("organization_id", context.organizationId),
  ]);

  const milestones = (milestonesResult.data ?? []) as Record<string, unknown>[];
  const risks = (risksResult.data ?? []) as Record<string, unknown>[];
  const outcomes = (outcomesResult.data ?? []) as Record<string, unknown>[];
  const now = Date.now();

  const projects = portfolio.projects.map((project) => {
    const projectMilestones = milestones.filter((row) => String(row.project_id) === project.id);
    const projectRisks = risks.filter((row) => String(row.project_id) === project.id);
    const projectOutcomes = outcomes.filter((row) => String(row.project_id) === project.id);
    const completedMilestones = projectMilestones.filter((row) => row.status === "DONE").length;
    const overdueMilestones = projectMilestones.filter((row) => row.status !== "DONE" && row.due_date && new Date(String(row.due_date)).getTime() < now).length;
    const highOpenRisks = projectRisks.filter((row) => row.level === "HIGH" && row.status !== "CLOSED").length;
    const achievedOutcomes = projectOutcomes.filter((row) => row.status === "ACHIEVED" || row.status === "DONE").length;

    const signals = calculateTransformationSignals({
      deliveryHealth: project.deliveryHealth,
      outcomeHealth: project.outcomeHealth,
      overdueMilestones,
      highOpenRisks,
      totalMilestones: projectMilestones.length,
      completedMilestones,
      totalOutcomes: projectOutcomes.length,
      achievedOutcomes,
    });

    const interventionInput = {
      transformationStatus: project.transformationStatus,
      predictiveRiskScore: signals.score,
      predictiveRiskLevel: signals.level,
      trend: signals.trend,
      overdueMilestones,
      highOpenRisks,
    };

    const priority = calculateInterventionPriority(interventionInput);
    const recommendedActions = getRecommendedActions(interventionInput);

    return {
      ...project,
      predictiveRiskScore: signals.score,
      predictiveRiskLevel: signals.level,
      trend: signals.trend,
      signals: signals.signals,
      overdueMilestones,
      highOpenRisks,
      interventionPriorityScore: priority.score,
      interventionPriority: priority.priority,
      recommendedActions,
    };
  });

  projects.sort((a, b) => b.interventionPriorityScore - a.interventionPriorityScore);

  return {
    projects,
    summary: {
      totalProjects: projects.length,
      critical: projects.filter((project) => project.predictiveRiskLevel === "CRITICAL").length,
      high: projects.filter((project) => project.predictiveRiskLevel === "HIGH").length,
      moderate: projects.filter((project) => project.predictiveRiskLevel === "MODERATE").length,
      low: projects.filter((project) => project.predictiveRiskLevel === "LOW").length,
      deteriorating: projects.filter((project) => project.trend === "DETERIORATING").length,
      criticalInterventions: projects.filter((project) => project.interventionPriority === "CRITICAL").length,
      highInterventions: projects.filter((project) => project.interventionPriority === "HIGH").length,
    },
  };
}