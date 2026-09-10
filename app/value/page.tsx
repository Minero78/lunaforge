import Link from "next/link";

const metrics = [
  ["Portfolio investment", "—"],
  ["Expected annual benefit", "—"],
  ["Realized annual benefit", "—"],
  ["Expected ROI", "—"],
  ["Actual ROI", "—"],
  ["Payback", "—"],
];

export default function ValueRealizationPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/" className="font-semibold tracking-wide">STRATOVA</Link><Link href="/intelligence" className="text-sm text-slate-500">Intelligence</Link></div></header>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Value realization</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Measure transformation as business value</h1>
        <p className="mt-3 max-w-3xl text-slate-500">Track investment, expected benefit, realized benefit, ROI, and payback so mining technology initiatives remain accountable after implementation.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{metrics.map(([label,value]) => <section key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></section>)}</div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Initiative value register</h2><div className="mt-5 overflow-hidden rounded-xl border border-slate-200"><div className="grid grid-cols-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"><span>Initiative</span><span>Investment</span><span>Benefit</span><span>ROI</span></div><div className="px-4 py-8 text-center text-sm text-slate-400">No tracked initiatives yet.</div></div></section>
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">Value discipline</h2><p className="mt-3 text-sm leading-6 text-slate-500">Expected benefits should be established before approval. Actual benefits should be updated after deployment, allowing the platform to compare the original business case with realized performance.</p><div className="mt-5 rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-300">ROI engine available through <span className="font-mono text-white">/api/v1/value/roi</span>.</div></aside>
        </div>
      </div>
    </main>
  );
}
