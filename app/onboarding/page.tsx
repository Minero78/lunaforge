import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Stratova</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Build your mining intelligence workspace.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Create your organization, invite your team, and manage assessments and sites from one secure workspace.
        </p>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["01", "Create organization", "Set your company profile and operating context."],
            ["02", "Add your team", "Assign owners, administrators, and members."],
            ["03", "Start QuickScan", "Run the MIS diagnostic for your operation."],
          ].map(([number, title, description]) => (
            <div key={number} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <span className="text-sm text-sky-300">{number}</span>
              <h2 className="mt-3 font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </div>
          ))}
        </section>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/quickscan" className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200">
            Start QuickScan
          </Link>
          <Link href="/" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-900">
            Back to Stratova
          </Link>
        </div>
      </div>
    </main>
  );
}
