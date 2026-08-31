"use client";

import { useEffect, useState } from "react";
import type { StratovaReportData } from "@/lib/reports/types";

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [report, setReport] = useState<StratovaReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id: assessmentId }) => {
      setId(assessmentId);
      return fetch(`/api/v1/assessments/${assessmentId}/report`);
    }).then(async (response) => {
      if (!response) return;
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to load report.");
      setReport(payload as StratovaReportData);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load report."));
  }, [params]);

  if (error) return <main className="min-h-screen bg-slate-950 px-6 py-16 text-white"><div className="mx-auto max-w-3xl rounded-3xl border border-rose-300/20 bg-rose-300/5 p-8"><p className="text-sm uppercase tracking-[0.24em] text-sky-300">Stratova</p><h1 className="mt-4 text-3xl font-semibold">Report unavailable</h1><p className="mt-3 text-slate-300">{error}</p></div></main>;
  if (!report || !id) return <main className="min-h-screen bg-slate-950 px-6 py-16 text-white"><div className="mx-auto max-w-5xl animate-pulse"><div className="h-10 w-64 rounded bg-white/10" /><div className="mt-8 h-64 rounded-3xl bg-white/5" /></div></main>;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900 print:bg-white">
      <article className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm sm:p-12 print:shadow-none">
        <header className="border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Stratova</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Mining Intelligence Assessment</h1>
          <p className="mt-4 text-lg text-slate-600">Executive diagnostic generated from the MIS framework.</p>
        </header>

        <section className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-950 p-7 text-white"><p className="text-sm uppercase tracking-wider text-slate-400">MIS score</p><p className="mt-3 text-6xl font-semibold">{report.score}<span className="ml-2 text-2xl text-slate-400">/100</span></p><p className="mt-3 font-semibold text-sky-300">{report.maturity}</p></div>
          <div className="rounded-2xl border border-slate-200 p-7"><p className="text-sm uppercase tracking-wider text-slate-500">Strongest capability</p><h2 className="mt-3 text-2xl font-semibold">{report.diagnosis.strongestCapability.title}</h2><p className="mt-2 text-4xl font-semibold">{report.diagnosis.strongestCapability.score}</p><p className="mt-3 text-slate-600">{report.diagnosis.strongestCapability.description}</p></div>
        </section>

        <section className="mt-10"><p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Capability profile</p><div className="mt-5 space-y-4">{report.dimensionScores.map((item) => <div key={item.dimension}><div className="flex justify-between text-sm font-medium"><span>{item.dimension}</span><span>{item.score}</span></div><div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-full rounded-full bg-slate-800" style={{ width: `${item.score}%` }} /></div></div>)}</div></section>

        <section className="mt-10 grid gap-5 sm:grid-cols-2"><div className="rounded-2xl border border-slate-200 p-7"><p className="text-sm uppercase tracking-wider text-slate-500">Primary constraint</p><h2 className="mt-3 text-2xl font-semibold">{report.diagnosis.primaryConstraint.title}</h2><p className="mt-2 text-3xl font-semibold">{report.diagnosis.primaryConstraint.score}</p><p className="mt-3 leading-7 text-slate-600">{report.diagnosis.primaryConstraint.description}</p></div><div className="rounded-2xl border border-sky-200 bg-sky-50 p-7"><p className="text-sm uppercase tracking-wider text-sky-700">Priority opportunity</p><h2 className="mt-3 text-2xl font-semibold">{report.diagnosis.opportunity.title}</h2><p className="mt-3 leading-7 text-slate-600">{report.diagnosis.opportunity.description}</p></div></section>

        <section className="mt-10"><p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Recommended action plan</p><div className="mt-5 grid gap-4 sm:grid-cols-3">{report.diagnosis.recommendations.map((item, index) => <div key={item.title} className="rounded-2xl border border-slate-200 p-6"><p className="text-xs font-semibold uppercase tracking-wider text-sky-700">0{index + 1} · {item.horizon}</p><h3 className="mt-3 font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.rationale}</p></div>)}</div></section>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">Report {report.reportVersion} · MIS {report.frameworkVersion} · Engine {report.engineVersion} · Assessment {id}</footer>
      </article>
    </main>
  );
}
