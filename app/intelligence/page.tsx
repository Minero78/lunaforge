import Link from "next/link";

export default function IntelligencePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/" className="font-semibold tracking-tight">STRATOVA</Link><Link href="/workspace" className="text-sm text-slate-400">Workspace</Link></div></header>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">Intelligence</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Mining transformation intelligence</h1>
        <p className="mt-3 max-w-3xl text-slate-400">Move from a point-in-time diagnostic to a measurable transformation trajectory.</p>
        <section className="mt-10 grid gap-4 md:grid-cols-4">
          {[['Current MIS','—'],['Change vs baseline','—'],['Priority gaps','—'],['Opportunities','—']].map(([label,value]) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></div>)}
        </section>
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="font-semibold">Maturity trajectory</h2><div className="mt-6 h-48 rounded-xl border border-dashed border-slate-700 p-6 text-sm text-slate-500">Complete assessments over time to visualize organizational maturity and dimension-level progress.</div></section>
        <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="font-semibold">Top opportunities</h2><p className="mt-2 text-sm text-slate-500">MIS-derived consulting opportunities will appear here.</p></section><section className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="font-semibold">Transformation roadmap</h2><div className="mt-4 space-y-2">{['0–90 days','3–6 months','6–12 months','12–24 months'].map((item) => <div key={item} className="rounded-xl bg-slate-800 px-4 py-3 text-sm">{item}<span className="float-right text-slate-500">Pending baseline</span></div>)}</div></section></div>
      </div>
    </main>
  );
}
