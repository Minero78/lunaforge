"use client";

import { useEffect, useState } from "react";
import type { StratovaResultPayload } from "@/lib/results/types";

const DIMENSION_LABELS: Record<string, string> = {
  engineering: "Engineering Intelligence",
  operations: "Operational Intelligence",
  data: "Data Foundation",
  spatial: "Spatial Intelligence",
  digital: "Digital Infrastructure",
  ai: "AI Readiness",
  value: "Value & Decision Intelligence",
};

export function ResultsDashboard({ assessmentId }: { assessmentId: string }) {
  const [data, setData] = useState<StratovaResultPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/v1/assessments/${assessmentId}/result`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to load results.");
        return payload as StratovaResultPayload;
      })
      .then(setData)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load results."));
  }, [assessmentId]);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-300/20 bg-rose-300/5 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Stratova</p>
          <h1 className="mt-4 text-3xl font-semibold">Results unavailable</h1>
          <p className="mt-3 text-slate-300">{error}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-4 w-24 rounded bg-white/10" />
          <div className="mt-6 h-12 max-w-xl rounded bg-white/10" />
          <div className="mt-10 h-56 rounded-3xl bg-white/5" />
        </div>
      </main>
    );
  }

  const { diagnosis } = data;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white sm:py-16">
      <div className="mx-auto max-w-6xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Stratova</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">Your Mining Intelligence Profile</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">A decision-oriented view of your organization&apos;s current capabilities, constraints, and next opportunity.</p>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10">
            <p className="text-sm uppercase tracking-wider text-slate-400">Mining Intelligence Score</p>
            <div className="mt-4 flex items-end gap-4"><span className="text-7xl font-semibold tracking-tight">{data.overallScore}</span><span className="pb-3 text-slate-400">/ 100</span></div>
            <p className="mt-4 inline-flex rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-sm font-semibold text-sky-200">{data.maturity}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10">
            <p className="text-sm uppercase tracking-wider text-slate-400">Strongest capability</p>
            <h2 className="mt-4 text-2xl font-semibold">{diagnosis.strongestCapability.title}</h2>
            <p className="mt-2 text-4xl font-semibold">{diagnosis.strongestCapability.score}</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{diagnosis.strongestCapability.description}</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="text-sm uppercase tracking-wider text-slate-400">Capability profile</p><h2 className="mt-2 text-2xl font-semibold">Where the organization stands</h2></div>
            <span className="text-xs text-slate-500">MIS {data.frameworkVersion} · Engine {data.engineVersion}</span>
          </div>
          <div className="mt-8 space-y-5">
            {data.dimensionScores.map((item) => (
              <div key={item.dimension}>
                <div className="mb-2 flex justify-between gap-4 text-sm"><span className="text-slate-200">{DIMENSION_LABELS[item.dimension]}</span><span className="font-semibold text-white">{item.score}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sky-400" style={{ width: `${item.score}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-sm uppercase tracking-wider text-slate-400">Primary constraint</p>
            <h2 className="mt-3 text-2xl font-semibold">{diagnosis.primaryConstraint.title}</h2>
            <p className="mt-2 text-4xl font-semibold">{diagnosis.primaryConstraint.score}</p>
            <p className="mt-4 leading-7 text-slate-300">{diagnosis.primaryConstraint.description}</p>
          </div>
          <div className="rounded-3xl border border-sky-300/20 bg-sky-300/5 p-8">
            <p className="text-sm uppercase tracking-wider text-sky-200">Top opportunity</p>
            <h2 className="mt-3 text-2xl font-semibold">{diagnosis.opportunity.title}</h2>
            <p className="mt-4 leading-7 text-slate-300">{diagnosis.opportunity.description}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-white/10 px-3 py-2">Impact: {diagnosis.opportunity.impact}</span><span className="rounded-full bg-white/10 px-3 py-2">Effort: {diagnosis.opportunity.effort}</span><span className="rounded-full bg-white/10 px-3 py-2">Readiness: {diagnosis.opportunity.readiness}</span></div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10">
          <p className="text-sm uppercase tracking-wider text-slate-400">Recommended next steps</p>
          <h2 className="mt-2 text-2xl font-semibold">Turn the assessment into action</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {diagnosis.recommendations.map((recommendation, index) => (
              <article key={recommendation.title} className="rounded-2xl border border-white/10 bg-black/10 p-6"><p className="text-xs font-semibold uppercase tracking-wider text-sky-300">0{index + 1} · {recommendation.horizon}</p><h3 className="mt-3 text-lg font-semibold">{recommendation.title}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{recommendation.rationale}</p></article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-sky-300/20 bg-sky-300/5 p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">Next step</p>
          <h2 className="mt-3 text-3xl font-semibold">Get the full Stratova assessment report</h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">Receive the complete diagnostic context and a structured set of recommendations for your organization.</p>
          <a href={`/results/${assessmentId}/lead`} className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200">Get full report</a>
        </section>

        <footer className="py-10 text-xs text-slate-500">Assessment {data.assessmentId} · Results generated from the deterministic MIS 1.0 engine.</footer>
      </div>
    </main>
  );
}
