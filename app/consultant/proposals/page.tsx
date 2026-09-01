import Link from "next/link";

const workflow = [
  { step: "01", title: "Select assessment", text: "Start from a completed Mining Intelligence assessment and preserve its evidence trail." },
  { step: "02", title: "Confirm scope", text: "Review prioritized opportunities and choose the services that belong in the engagement." },
  { step: "03", title: "Build proposal", text: "Generate objectives, scope, roadmap, assumptions, and next steps from the deterministic proposal engine." },
  { step: "04", title: "Commercial review", text: "Add pricing, delivery assumptions, stakeholders, and statement-of-work terms before client release." },
];

export default function ProposalWorkspacePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-semibold tracking-wide">STRATOVA</Link>
          <div className="flex gap-5 text-sm text-slate-500"><Link href="/consultant">Consultant Hub</Link><Link href="/consultant/pipeline">Pipeline</Link></div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Proposal workspace</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Turn intelligence into an engagement</h1>
        <p className="mt-3 max-w-3xl text-slate-500">A controlled commercial workspace for converting assessment findings into a client-ready mining transformation proposal.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {workflow.map((item) => <section key={item.step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-xs font-semibold text-sky-700">{item.step}</span><h2 className="mt-3 font-semibold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p></section>)}
        </div>
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Proposal composition</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{["Executive summary","Business objectives","Recommended scope","Transformation roadmap","Assumptions","Commercial next steps"].map((label) => <div key={label} className="rounded-xl bg-slate-50 px-4 py-3 text-sm">{label}</div>)}</div></div>
          <aside className="rounded-2xl bg-slate-950 p-6 text-white"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Governance</p><h2 className="mt-3 text-xl font-semibold">Human approval remains mandatory</h2><p className="mt-3 text-sm leading-6 text-slate-300">Generated content is a commercial starting point. Pricing, commitments, scope boundaries, and contractual terms require consultant approval before release.</p></aside>
        </section>
      </div>
    </main>
  );
}
