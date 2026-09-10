import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { calculateDeliveryHealth, type DeliveryHealth } from "@/lib/consulting/delivery-health";

export type PortfolioProjectHealth = {
  id: string;
  name: string;
  projectStatus: string;
  deliveryHealth: DeliveryHealth;
  progress: number;
  overdueMilestones: number;
  highOpenRisks: number;
  interventionRequired: boolean;
};

export type PortfolioDeliveryIntelligence = {
  projects: PortfolioProjectHealth[];
  summary: {
    totalProjects: number;
    onTrack: number;
    watch: number;
    atRisk: number;
    complete: number;
    overdueMilestones: number;
    criticalRisks: number;
    interventionRequired: number;
  };
};

export async function getPortfolioDeliveryIntelligence(): Promise<PortfolioDeliveryIntelligence> {
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();

  const [projectsResult, milestonesResult, risksResult] = await Promise.all([
    supabase.from<Record<string, unknown>>("consulting_projects").select("id, name, status").eq("organization_id", context.organizationId).order("updated_at", { ascending: false }),
    supabase.from<Record<string, unknown>>("project_milestones").select("project_id, status, due_date, risk_level").eq("organization_id", context.organizationId),
    supabase.from<Record<string, unknown>>("project_risks").select("project_id, level, status").eq("organization_id", context.organizationId),
  ]);

  if (projectsResult.error) throw new Error(`PORTFOLIO_PROJECTS_READ_FAILED:${projectsResult.error.message}`);
  if (milestonesResult.error) throw new Error(`PORTFOLIO_MILESTONES_READ_FAILED:${milestonesResult.error.message}`);
  if (risksResult.error) throw new Error(`PORTFOLIO_RISKS_READ_FAILED:${risksResult.error.message}`);

  const milestones = (milestonesResult.data ?? []) as Record<string, unknown>[];
  const risks = (risksResult.data ?? []) as Record<string, unknown>[];
  const now = new Date().getTime();

  const projects = ((projectsResult.data ?? []) as Record<string, unknown>[]).map((project) => {
    const id = String(project.id);
    const projectMilestones = milestones.filter((item) => String(item.project_id) === id);
    const projectRisks = risks.filter((item) => String(item.project_id) === id);
    const completed = projectMilestones.filter((item) => item.status === "DONE").length;
    const overdue = projectMilestones.filter((item) => item.status !== "DONE" && item.due_date && new Date(String(item.due_date)).getTime() < now).length;
    const highMilestones = projectMilestones.filter((item) => item.risk_level === "HIGH").length;
    const highOpenRisks = projectRisks.filter((item) => item.level === "HIGH" && item.status !== "CLOSED").length;
    const intelligence = calculateDeliveryHealth({ totalMilestones: projectMilestones.length, completedMilestones: completed, overdueMilestones: overdue, highRiskMilestones: highMilestones, highOpenRisks });

    return { id, name: String(project.name), projectStatus: String(project.status), deliveryHealth: intelligence.health, progress: intelligence.progress, overdueMilestones: overdue, highOpenRisks, interventionRequired: intelligence.interventionRequired };
  });

  const summary = {
    totalProjects: projects.length,
    onTrack: projects.filter((p) => p.deliveryHealth === "ON_TRACK").length,
    watch: projects.filter((p) => p.deliveryHealth === "WATCH").length,
    atRisk: projects.filter((p) => p.deliveryHealth === "AT_RISK").length,
    complete: projects.filter((p) => p.deliveryHealth === "COMPLETE").length,
    overdueMilestones: projects.reduce((sum, p) => sum + p.overdueMilestones, 0),
    criticalRisks: projects.reduce((sum, p) => sum + p.highOpenRisks, 0),
    interventionRequired: projects.filter((p) => p.interventionRequired).length,
  };

  return { projects, summary };
}