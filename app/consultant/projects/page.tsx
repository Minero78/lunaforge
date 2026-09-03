import Link from "next/link";
import { listConsultingProjects } from "@/lib/consulting/project-repository";
import { listValueCases } from "@/lib/value/value-case-repository";

export default async function ConsultantProjectsPage() {
  const projects = await listConsultingProjects();
  const valueCases = await listValueCases();
  const valueByOpportunity = new Map(valueCases.map((item) => [item.opportunityId, item]));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/" className="font-semibold">STRATOVA</Link><Link href="/consultant" className="text-sm text-slate-500">Consultant Hub</Link></div></header>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Engagement workspace</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Consulting projects</h1>
        <p className="mt-3 max-w-2xl text-slate-500">Track won opportunities through delivery and connect commercial commitments to realized value.</p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-6 gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"><span>Project</span><span>Status</span><span>Start</span><span>Target</span><span>Contract</span><span>Value realization</span></div>
            {projects.length === 0 ? <div className="px-5 py-10 text-sm text-slate-500">No consulting projects yet. Move an opportunity to WON in the pipeline to create an engagement.</div> : projects.map((project) => {
              const value = valueByOpportunity.get(project.opportunityId);
              return <Link href={`/consultant/projects/${project.id}`} key={project.id} className="grid grid-cols-6 gap-4 border-b border-slate-100 px-5 py-4 text-sm transition hover:bg-slate-50 last:border-0"><div><p className="font-medium">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.id.slice(0, 8)}</p></div><span className="text-xs font-semibold">{project.status}</span><span>{project.startDate ?? "—"}</span><span>{project.targetEndDate ?? "—"}</span><span>{project.contractValue == null ? "—" : `${project.currency ?? "USD"} ${project.contractValue.toLocaleString()}`}</span><span>{value?.actualRoiPercent == null ? "Not measured" : `${value.actualRoiPercent.toFixed(1)}% ROI`}</span></Link>;
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
