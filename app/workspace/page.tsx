import Link from "next/link";

const metrics = [
  ["Active assessments", "0", "Start your first diagnostic"],
  ["Sites", "0", "Add an operating site"],
  ["Team members", "1", "Invite collaborators"],
  ["Avg. MIS score", "—", "Complete a QuickScan"],
];

export default function WorkspacePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-semibold tracking-tight">STRATOVA</Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/quickscan" className="rounded-lg bg-slate-950 px-4 py-2 font-medium text-white">New QuickScan</Link>
            <Link href="/auth" className="text-slate-500 hover:text-slate-950">Account</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Mining intelligence workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your organization</h1>
          <p className="mt-2 text-slate-500">A single operating view for assessments, sites, and transformation priorities.</p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([label, value, hint]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{value}</p>
              <p className="mt-2 text-xs text-slate-400">{hint}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div><h2 className="font-semibold">Recent assessments</h2><p className="mt-1 text-sm text-slate-500">Track diagnostic activity across your organization.</p></div>
              <Link href="/quickscan" className="text-sm font-medium text-sky-700">Start one</Link>
            </div>
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="font-medium">No assessments yet</p>
              <p className="mt-1 text-sm text-slate-500">Run your first MIS QuickScan to create your baseline.</p>
              <Link href="/quickscan" className="mt-4 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white">Start QuickScan</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Transformation focus</h2>
            <p className="mt-1 text-sm text-slate-500">Your highest-priority opportunities will appear here.</p>
            <div className="mt-8 space-y-3">
              {["Operational intelligence", "Data & spatial integration", "AI readiness"].map((item) => <div key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{item}<span className="float-right text-slate-300">—</span></div>)}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
