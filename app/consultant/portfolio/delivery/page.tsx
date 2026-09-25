import Link from "next/link";
import { getPortfolioDeliveryIntelligence } from "@/lib/consulting/portfolio-delivery-intelligence";

export default async function PortfolioDeliveryPage() {
  const portfolio = await getPortfolioDeliveryIntelligence();
  const intervention = portfolio.projects.filter((project) => project.interventionRequired);

  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/" className="font-semibold">STRATOVA</Link><Link href="/consultant/projects" className="text-sm text-slate-500">Projects</Link></div></header>
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Executive intelligence</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Portfolio Delivery Health</h1>
      <p className="mt-3 max-w-3xl text-slate-600">A consolidated view of project execution risk, delivery progress and required management intervention.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Metric label="Total projects" value={portfolio.summary.totalProjects} />
        <Metric label="At risk" value={portfolio.summary.atRisk} />
        <Metric label="Watch" value={portfolio.summary.watch} />
        <Metric label="Intervention required" value={portfolio.summary.interventionRequired} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Metric label="On track" value={portfolio.summary.onTrack} />
        <Metric label="Overdue milestones" value={portfolio.summary.overdueMilestones} />
        <Metric label="Critical open risks" value={portfolio.summary.criticalRisks} />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Executive intervention queue</p><h2 className="mt-1 text-xl font-semibold">Projects requiring attention</h2></div>
        <div className="mt-5 space-y-3">
          {intervention.length === 0 ? <p className="text-sm text-slate-500">No delivery intervention is currently required.</p> : intervention.map((project) =>
            <Link key={project.id} href={`/consultant/projects/${project.id}`} className="block rounded-xl border border-slate-200 p-4 transition hover:border-slate-400">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><p className="font-semibold">{project.name}</p><p className="mt-1 text-sm text-slate-500">{project.deliveryHealth} · {project.progress}% complete</p></div><div className="flex gap-4 text-sm"><span>{project.overdueMilestones} overdue</span><span>{project.highOpenRisks} critical risks</span></div></div>
            </Link>
          )}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5"><h2 className="font-semibold">Project delivery matrix</h2></div>
        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-4">Project</th><th className="px-6 py-4">Delivery health</th><th className="px-6 py-4">Progress</th><th className="px-6 py-4">Overdue</th><th className="px-6 py-4">Critical risks</th><th className="px-6 py-4"></th></tr></thead><tbody>{portfolio.projects.map((project) => <tr key={project.id} className="border-t border-slate-100"><td className="px-6 py-4 font-medium">{project.name}</td><td className="px-6 py-4">{project.deliveryHealth}</td><td className="px-6 py-4">{project.progress}%</td><td className="px-6 py-4">{project.overdueMilestones}</td><td className="px-6 py-4">{project.highOpenRisks}</td><td className="px-6 py-4"><Link href={`/consultant/projects/${project.id}`} className="text-sky-700">Open →</Link></td></tr>)}</tbody></table></div>
      </section>
    </div>
  </main>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}