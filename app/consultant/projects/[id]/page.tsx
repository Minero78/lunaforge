import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { ProjectControls } from "./ProjectControls";
import { ValueRealizationForm } from "./ValueRealizationForm";

type Project = {
  id: string;
  opportunity_id: string;
  name: string;
  status: string;
  start_date: string | null;
  target_end_date: string | null;
  completed_at: string | null;
  contract_value: number | null;
  currency: string | null;
};

type ValueCase = {
  investment: number;
  expected_annual_benefit: number;
  actual_annual_benefit: number | null;
  currency: string;
  roi_percent: number;
  payback_months: number | null;
  actual_roi_percent: number | null;
  actual_payback_months: number | null;
};

export default async function ConsultantProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();
  const projectResult = await supabase.from<Record<string, unknown>>("consulting_projects")
    .select("id, opportunity_id, name, status, start_date, target_end_date, completed_at, contract_value, currency")
    .eq("id", id).eq("organization_id", context.organizationId).maybeSingle();
  if (projectResult.error || !projectResult.data) notFound();
  const project = projectResult.data as Project;

  const valueResult = await supabase.from<Record<string, unknown>>("opportunity_value_cases")
    .select("investment, expected_annual_benefit, actual_annual_benefit, currency, roi_percent, payback_months, actual_roi_percent, actual_payback_months")
    .eq("organization_id", context.organizationId).eq("opportunity_id", project.opportunity_id).maybeSingle();
  const valueCase = (valueResult.data as ValueCase | null) ?? null;
  const actualBenefit = valueCase?.actual_annual_benefit;
  const benefitGap = valueCase && actualBenefit != null ? actualBenefit - valueCase.expected_annual_benefit : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><Link href="/" className="font-semibold">STRATOVA</Link><Link href="/consultant/projects" className="text-sm text-slate-500">All projects</Link></div></header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/consultant/projects" className="text-sm text-sky-700">← Projects</Link>
        <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Project delivery</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">{project.name}</h1><p className="mt-2 text-sm text-slate-500">Opportunity {project.opportunity_id.slice(0, 8)}</p></div><span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{project.status}</span></div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Metric label="Contract value" value={project.contract_value == null ? "—" : `${project.currency ?? "USD"} ${project.contract_value.toLocaleString()}`} />
          <Metric label="Start" value={project.start_date ?? "—"} />
          <Metric label="Target end" value={project.target_end_date ?? "—"} />
          <Metric label="Completed" value={project.completed_at ? new Date(project.completed_at).toLocaleDateString() : "Not completed"} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">Delivery lifecycle</h2><p className="mt-2 text-sm leading-6 text-slate-500">Control project status and delivery dates. Closed states remain immutable by policy.</p><ProjectControls projectId={project.id} status={project.status} startDate={project.start_date} targetEndDate={project.target_end_date} /></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">Value realization</h2>{valueCase ? <><div className="mt-5 grid grid-cols-2 gap-3"><Metric label="Expected ROI" value={`${valueCase.roi_percent.toFixed(1)}%`} /><Metric label="Actual ROI" value={valueCase.actual_roi_percent == null ? "Not measured" : `${valueCase.actual_roi_percent.toFixed(1)}%`} /><Metric label="Expected payback" value={valueCase.payback_months == null ? "—" : `${valueCase.payback_months.toFixed(1)} mo`} /><Metric label="Actual payback" value={valueCase.actual_payback_months == null ? "Not measured" : `${valueCase.actual_payback_months.toFixed(1)} mo`} /></div><div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm"><p>Expected annual benefit: <strong>{valueCase.currency} {valueCase.expected_annual_benefit.toLocaleString()}</strong></p><p className="mt-1">Actual annual benefit: <strong>{actualBenefit == null ? "Not measured" : `${valueCase.currency} ${actualBenefit.toLocaleString()}`}</strong></p>{benefitGap != null && <p className="mt-1 text-slate-500">Variance: {benefitGap >= 0 ? "+" : ""}{valueCase.currency} {benefitGap.toLocaleString()}</p>}</div><ValueRealizationForm opportunityId={project.opportunity_id} valueCase={valueCase} /></> : <p className="mt-5 text-sm text-slate-500">No value case has been recorded for this engagement yet.</p>}</section>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>; }
