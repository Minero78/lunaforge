import Link from "next/link";
import { getPortfolioTransformationIntelligence } from "@/lib/consulting/portfolio-transformation-intelligence";

export default async function PortfolioTransformationPage() {
  const portfolio = await getPortfolioTransformationIntelligence();
  const escalation = portfolio.projects.filter((project) => project.transformationStatus === "EXECUTIVE_ESCALATION");

  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/" className="font-semibold">STRATOVA</Link><div className="flex gap-5 text-sm"><Link href="/consultant/projects">Projects</Link><Link href="/consultant/portfolio/delivery">Delivery portfolio</Link></div></div></header>
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">Transformation management intelligence</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Portfolio Transformation Health</h1>
      <p className="mt-3 max-w-3xl text-slate-600">Unifies execution performance and outcome realization into one executive decision framework.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric label="Healthy" value={portfolio.summary.healthy} />
        <Metric label="Delivery intervention" value={portfolio.summary.deliveryIntervention} />
        <Metric label="Value intervention" value={portfolio.summary.valueIntervention} />
        <Metric label="Executive escalation" value={portfolio.summary.executiveEscalation} />
        <Metric label="Complete" value={portfolio.summary.complete} />
        <Metric label="Total projects" value={portfolio.summary.totalProjects} />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Executive escalation queue</p>
        <h2 className="mt-1 text-xl font-semibold">Projects where delivery and value are both deteriorating</h2>
        <div className="mt-5 space-y-3">
          {escalation.length === 0 ? <p className="text-sm text-slate-500">No executive escalations are currently detected.</p> : escalation.map((project) =>
            <Link key={project.id} href={`/consultant/projects/${project.id}`} className="block rounded-xl border border-slate-200 p-4 transition hover:border-slate-400">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><p className="font-semibold">{project.name}</p><p className="mt-1 text-sm text-slate-500">Delivery: {project.deliveryHealth} · Outcome: {project.outcomeHealth}</p></div><p className="font-semibold text-red-700">EXECUTIVE ESCALATION</p></div>
            </Link>
          )}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5"><h2 className="font-semibold">Transformation matrix</h2></div>
        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Project</th><th className="px-6 py-4">Delivery</th><th className="px-6 py-4">Outcome</th><th className="px-6 py-4">Transformation status</th><th className="px-6 py-4">Delivery progress</th><th className="px-6 py-4">Outcome progress</th></tr></thead><tbody>{portfolio.projects.map((project) => <tr key={project.id} className="border-t border-slate-100"><td className="px-6 py-4 font-medium"><Link href={`/consultant/projects/${project.id}`}>{project.name}</Link></td><td className="px-6 py-4">{project.deliveryHealth}</td><td className="px-6 py-4">{project.outcomeHealth}</td><td className="px-6 py-4 font-semibold">{project.transformationStatus}</td><td className="px-6 py-4">{project.deliveryProgress}%</td><td className="px-6 py-4">{project.outcomeProgress}%</td></tr>)}</tbody></table></div>
      </section>
    </div>
  </main>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}