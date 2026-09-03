import Link from "next/link";
import { listConsultingProjects } from "@/lib/consulting/project-repository";
import { listValueCases } from "@/lib/value/value-case-repository";

export default async function ConsultantOutcomesPage() {
  const [projects, valueCases] = await Promise.all([listConsultingProjects(), listValueCases()]);
  const valueByOpportunity = new Map(valueCases.map((value) => [value.opportunityId, value]));
  const active = projects.filter((project) => project.status === "ACTIVE").length;
  const completed = projects.filter((project) => project.status === "COMPLETED").length;
  const contractValue = projects.reduce((sum, project) => sum + (project.contractValue ?? 0), 0);
  const expectedBenefit = valueCases.reduce((sum, value) => sum + value.expectedAnnualBenefit, 0);
  const actualMeasured = valueCases.filter((value) => value.actualAnnualBenefit != null);
  const actualBenefit = actualMeasured.reduce((sum, value) => sum + (value.actualAnnualBenefit ?? 0), 0);
  const roiMeasured = valueCases.filter((value) => value.actualRoiPercent != null);
  const averageActualRoi = roiMeasured.length ? roiMeasured.reduce((sum, value) => sum + (value.actualRoiPercent ?? 0), 0) / roiMeasured.length : null;

  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/" className="font-semibold">STRATOVA</Link><Link href="/consultant" className="text-sm text-slate-500">Consultant Hub</Link></div></header><div className="mx-auto max-w-7xl px-6 py-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Executive outcomes</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Transformation portfolio</h1><p className="mt-3 max-w-3xl text-slate-500">Portfolio-level view of delivery activity and measurable value realization across consulting engagements.</p>
  <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Active projects" value={String(active)} /><Metric label="Completed projects" value={String(completed)} /><Metric label="Contract value" value={contractValue.toLocaleString()} /><Metric label="Expected annual benefit" value={expectedBenefit.toLocaleString()} /></div>
  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Metric label="Actual measured benefit" value={actualMeasured.length ? actualBenefit.toLocaleString() : "Not measured"} /><Metric label="Measured value cases" value={`${actualMeasured.length} / ${valueCases.length}`} /><Metric label="Average actual ROI" value={averageActualRoi == null ? "Not measured" : `${averageActualRoi.toFixed(1)}%`} /></div>
  <section className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="min-w-[900px]"><div className="grid grid-cols-6 gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"><span>Project</span><span>Status</span><span>Contract</span><span>Expected benefit</span><span>Actual benefit</span><span>ROI</span></div>{projects.length === 0 ? <div className="px-5 py-10 text-sm text-slate-500">No projects in the portfolio.</div> : projects.map((project) => { const value = valueByOpportunity.get(project.opportunityId); return <Link key={project.id} href={`/consultant/projects/${project.id}`} className="grid grid-cols-6 gap-4 border-b border-slate-100 px-5 py-4 text-sm hover:bg-slate-50 last:border-0"><span className="font-medium">{project.name}</span><span className="text-xs font-semibold">{project.status}</span><span>{project.contractValue == null ? "—" : `${project.currency ?? "USD"} ${project.contractValue.toLocaleString()}`}</span><span>{value ? `${value.currency} ${value.expectedAnnualBenefit.toLocaleString()}` : "—"}</span><span>{value?.actualAnnualBenefit == null ? "Not measured" : `${value.currency} ${value.actualAnnualBenefit.toLocaleString()}`}</span><span>{value?.actualRoiPercent == null ? "Not measured" : `${value.actualRoiPercent.toFixed(1)}%`}</span></Link>; })}</div></section></div></main>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>; }
