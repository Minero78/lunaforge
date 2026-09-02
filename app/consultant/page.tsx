import Link from "next/link";

const cards = [
  ["Organizations", "—", "Manage mining clients and operating contexts."],
  ["Sites", "—", "Track operations across your client portfolio."],
  ["Assessments", "Live", "Open scored diagnostics and baselines."],
  ["Opportunities", "Live", "Convert capability gaps into consulting conversations."],
  ["Projects", "Next", "Track transformation engagements and outcomes."],
  ["Pipeline", "Live", "Move qualified opportunities toward revenue."],
];

export default function ConsultantPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-semibold">STRATOVA</Link>
          <Link href="/workspace" className="text-sm text-slate-500">Workspace</Link>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Consultant hub</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Your consulting portfolio</h1>
        <p className="mt-3 max-w-2xl text-slate-500">A command center for client organizations, diagnostics, opportunities, and transformation engagements.</p>
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(([label, value, description]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
            </div>
          ))}
        </section>
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Live intelligence workflow</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {["Diagnose", "Qualify", "Propose", "Deliver", "Measure"].map((step, index) => (
              <div key={step} className="rounded-xl bg-slate-50 p-4">
                <span className="text-xs text-sky-700">0{index + 1}</span>
                <p className="mt-2 font-medium">{step}</p>
              </div>
            ))}
          </div>
          <Link href="/consultant/pipeline" className="mt-6 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">Open commercial pipeline</Link>
        </section>
      </div>
    </main>
  );
}
