import Link from "next/link";
import { getPortfolioPredictiveIntelligence } from "@/lib/consulting/portfolio-predictive-intelligence";
import { InterventionActionBoard } from "./InterventionActionBoard";

export default async function ExecutiveActionCenterPage() {
  const portfolio = await getPortfolioPredictiveIntelligence();
  const queue = portfolio.projects.filter((project) => project.recommendedActions.length > 0);

  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/" className="font-semibold">STRATOVA</Link><div className="flex gap-5 text-sm"><Link href="/consultant/portfolio/predictive">Predictive portfolio</Link><Link href="/consultant/portfolio/transformation">Transformation</Link></div></div></header>
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">Executive decision intelligence</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Intervention Action Center</h1>
      <p className="mt-3 max-w-3xl text-slate-600">Convert transformation signals into prioritized management actions and accountable intervention owners.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Metric label="Critical interventions" value={portfolio.summary.criticalInterventions} />
        <Metric label="High interventions" value={portfolio.summary.highInterventions} />
        <Metric label="Deteriorating" value={portfolio.summary.deteriorating} />
        <Metric label="Projects" value={portfolio.summary.totalProjects} />
      </div>

      <section className="mt-8 space-y-5">
        {queue.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No intervention playbooks are currently required.</div> : queue.map((project) =>
          <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div><Link href={`/consultant/projects/${project.id}`} className="text-xl font-semibold hover:underline">{project.name}</Link><p className="mt-1 text-sm text-slate-500">Priority score: {project.interventionPriorityScore}/100 · Predictive risk: {project.predictiveRiskScore}/100 · Trend: {project.trend}</p></div>
              <div className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">{project.interventionPriority}</div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detected signals</p><ul className="mt-3 space-y-2 text-sm">{project.signals.length ? project.signals.map((signal) => <li key={signal}>• {signal}</li>) : <li>• No material warning signals</li>}</ul></div>
              <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended actions</p><div className="mt-3 space-y-3">{project.recommendedActions.map((action) => <div key={action.title} className="rounded-lg border border-slate-200 bg-white p-3"><p className="font-medium">{action.title}</p><p className="mt-1 text-sm text-slate-600">{action.description}</p><p className="mt-2 text-xs font-semibold text-slate-500">OWNER: {action.owner} · URGENCY: {action.urgency}</p></div>)}</div></div>
            </div>
          </article>
        )}
      </section>

      <InterventionActionBoard />
    </div>
  </main>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}