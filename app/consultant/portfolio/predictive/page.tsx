import Link from "next/link";
import { getPortfolioPredictiveIntelligence } from "@/lib/consulting/portfolio-predictive-intelligence";

export default async function PredictivePortfolioPage() {
  const portfolio = await getPortfolioPredictiveIntelligence();
  const warnings = portfolio.projects.filter((project) => project.predictiveRiskLevel === "CRITICAL" || project.predictiveRiskLevel === "HIGH");

  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/" className="font-semibold">STRATOVA</Link><div className="flex gap-5 text-sm"><Link href="/consultant/portfolio/delivery">Delivery</Link><Link href="/consultant/portfolio/transformation">Transformation</Link></div></div></header>
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Predictive intelligence</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Early Warning Portfolio</h1>
      <p className="mt-3 max-w-3xl text-slate-600">Prioritize projects using leading risk signals rather than waiting for final delivery failure.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric label="Critical" value={portfolio.summary.critical} />
        <Metric label="High risk" value={portfolio.summary.high} />
        <Metric label="Moderate" value={portfolio.summary.moderate} />
        <Metric label="Low" value={portfolio.summary.low} />
        <Metric label="Deteriorating" value={portfolio.summary.deteriorating} />
        <Metric label="Total projects" value={portfolio.summary.totalProjects} />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Early warning queue</p>
        <h2 className="mt-1 text-xl font-semibold">Highest probability of future intervention</h2>
        <div className="mt-5 space-y-3">
          {warnings.length === 0 ? <p className="text-sm text-slate-500">No high-severity predictive warnings detected.</p> : warnings.map((project) =>
            <Link key={project.id} href={`/consultant/projects/${project.id}`} className="block rounded-xl border border-slate-200 p-4 transition hover:border-slate-400">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><p className="font-semibold">{project.name}</p><p className="mt-1 text-sm text-slate-500">Risk score: {project.predictiveRiskScore}/100 · Trend: {project.trend}</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{project.signals.map((signal) => <li key={signal}>{signal}</li>)}</ul></div><p className="font-semibold text-amber-700">{project.predictiveRiskLevel}</p></div>
            </Link>
          )}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5"><h2 className="font-semibold">Predictive project ranking</h2></div>
        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Project</th><th className="px-6 py-4">Risk score</th><th className="px-6 py-4">Risk level</th><th className="px-6 py-4">Trend</th><th className="px-6 py-4">Signals</th></tr></thead><tbody>{portfolio.projects.map((project) => <tr key={project.id} className="border-t border-slate-100"><td className="px-6 py-4 font-medium"><Link href={`/consultant/projects/${project.id}`}>{project.name}</Link></td><td className="px-6 py-4">{project.predictiveRiskScore}/100</td><td className="px-6 py-4">{project.predictiveRiskLevel}</td><td className="px-6 py-4">{project.trend}</td><td className="px-6 py-4">{project.signals.length}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  </main>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}