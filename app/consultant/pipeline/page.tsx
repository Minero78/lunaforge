import Link from "next/link";

const stages = [
  ["IDENTIFIED", "New opportunities generated from diagnostics."],
  ["QUALIFIED", "Prioritized opportunities ready for discovery."],
  ["PROPOSED", "Commercial proposals currently under consideration."],
  ["WON", "Projects converted into engagements."],
  ["LOST", "Closed opportunities retained for learning."],
];

export default function ConsultantPipelinePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/" className="font-semibold">STRATOVA</Link><Link href="/consultant" className="text-sm text-slate-500">Consultant Hub</Link></div></header>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Commercial pipeline</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Consulting opportunities</h1>
        <p className="mt-3 max-w-2xl text-slate-500">Move qualified mining intelligence opportunities from diagnosis to commercial engagement.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {stages.map(([stage, description]) => <section key={stage} className="min-h-56 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-xs font-semibold tracking-wide">{stage}</h2><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">0</span></div><p className="mt-4 text-sm leading-6 text-slate-500">{description}</p></section>)}
        </div>
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">Pipeline principle</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Every opportunity should retain its diagnostic rationale, proposed service, priority, estimated value, and commercial stage so consulting activity can be measured alongside transformation outcomes.</p></section>
      </div>
    </main>
  );
}
