import Link from "next/link";

const pillars = [
  ["Current maturity", "—", "Complete an assessment to establish your baseline."],
  ["Priority opportunities", "0", "Strategic opportunities will appear after diagnosis."],
  ["Sites assessed", "0", "Add sites as your program expands."],
];

export default function ClientWorkspacePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-semibold tracking-tight">STRATOVA</Link>
          <Link href="/auth" className="text-sm text-slate-400 hover:text-white">Account</Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">Client workspace</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Your mining intelligence baseline</h1>
        <p className="mt-4 max-w-2xl text-slate-400">See where your operation stands today, what is holding progress back, and where the highest-value transformation opportunities are emerging.</p>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {pillars.map(([label, value, description]) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-4xl font-semibold">{value}</p><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p></div>)}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-7">
          <h2 className="text-xl font-semibold">Your transformation roadmap</h2>
          <p className="mt-2 text-sm text-slate-400">Your diagnostic will populate this roadmap with prioritized actions across engineering, operations, data, spatial, digital, AI, and value.</p>
          <Link href="/quickscan" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-slate-950">Run MIS QuickScan</Link>
        </section>
      </div>
    </main>
  );
}
