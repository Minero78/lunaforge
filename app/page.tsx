export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-300">
          Stratova
        </p>
        <div className="mt-8 max-w-4xl">
          <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
            Mining intelligence for better decisions.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Assess digital maturity, identify transformation constraints, and uncover
            high-value opportunities across engineering, operations, data, spatial
            intelligence, and AI.
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/quickscan"
            className="rounded-full bg-white px-7 py-3 text-center font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Start Mining Intelligence QuickScan™
          </a>
          <span className="rounded-full border border-white/10 px-7 py-3 text-center text-slate-300">
            MIS 1.0 · 14 indicators
          </span>
        </div>
      </div>
    </main>
  );
}
