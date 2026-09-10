import Link from "next/link";

const dimensions = ["Engineering", "Operations", "Data", "Spatial", "Digital", "AI", "Value"];

export default function ExecutiveReportPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 print:bg-white">
      <div className="mx-auto max-w-5xl px-6 py-8 print:max-w-none print:p-0">
        <div className="mb-5 flex items-center justify-between print:hidden"><Link href="/consultant" className="text-sm font-semibold">← Consultant Hub</Link><button onClick={undefined} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium">Print / Save as PDF</button></div>
        <article className="bg-white shadow-sm print:shadow-none">
          <header className="border-b border-slate-200 px-8 py-10 md:px-12"><p className="text-sm font-semibold tracking-[0.2em]">STRATOVA</p><p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Mining Intelligence Framework</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Executive Assessment Report</h1><p className="mt-3 max-w-2xl text-slate-500">Decision-support summary for mining intelligence maturity, transformation priorities, and value realization.</p></header>
          <section className="grid gap-6 border-b border-slate-200 px-8 py-8 md:grid-cols-3 md:px-12"><div><p className="text-xs uppercase tracking-wide text-slate-400">Overall score</p><p className="mt-2 text-4xl font-semibold">—</p></div><div><p className="text-xs uppercase tracking-wide text-slate-400">Maturity</p><p className="mt-2 text-xl font-semibold">Awaiting assessment</p></div><div><p className="text-xs uppercase tracking-wide text-slate-400">Framework</p><p className="mt-2 text-xl font-semibold">MIS-1.0</p></div></section>
          <section className="px-8 py-8 md:px-12"><h2 className="text-xl font-semibold">Dimension performance</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{dimensions.map((dimension) => <div key={dimension} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"><span className="text-sm font-medium">{dimension}</span><span className="text-sm text-slate-400">— / 100</span></div>)}</div></section>
          <section className="border-t border-slate-200 px-8 py-8 md:px-12"><h2 className="text-xl font-semibold">Executive priorities & roadmap</h2><p className="mt-3 text-sm leading-6 text-slate-500">When connected to a completed assessment, this section is populated from the deterministic opportunity and roadmap engines, preserving traceability from diagnostic score to recommended action.</p></section>
          <footer className="border-t border-slate-200 px-8 py-6 text-xs leading-5 text-slate-400 md:px-12">Decision-support only. This report does not constitute geotechnical, safety, legal, financial, or operational assurance.</footer>
        </article>
      </div>
    </main>
  );
}
