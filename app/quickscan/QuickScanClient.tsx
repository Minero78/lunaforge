"use client";

import { useEffect, useMemo, useState } from "react";
import { MIS_QUICKSCAN_QUESTIONS } from "@/lib/mis/questions";
import type { MisScoringResult } from "@/lib/mis/types";

const STORAGE_KEY = "stratova-quickscan-assessment";
const SCORE_OPTIONS = [1, 2, 3, 4, 5] as const;

export function QuickScanClient() {
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<MisScoringResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = MIS_QUICKSCAN_QUESTIONS[currentIndex];
  const currentAnswer = question ? answers[question.id] : undefined;
  const progress = useMemo(
    () => Math.round(((currentIndex + (currentAnswer ? 1 : 0)) / MIS_QUICKSCAN_QUESTIONS.length) * 100),
    [currentAnswer, currentIndex],
  );

  useEffect(() => {
    const savedId = window.localStorage.getItem(STORAGE_KEY);
    if (!savedId) return;

    fetch(`/api/v1/assessments/${savedId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Assessment unavailable");
        return response.json();
      })
      .then((data) => {
        setAssessmentId(data.id);
        const restored = Object.fromEntries(
          data.responses.map((response: { questionId: string; score: number }) => [
            response.questionId,
            response.score,
          ]),
        );
        setAnswers(restored);
        setCurrentIndex(Math.min(data.responses.length, MIS_QUICKSCAN_QUESTIONS.length - 1));
        if (data.status === "SCORED") {
          setResult(data.result ?? null);
        }
      })
      .catch(() => {
        window.localStorage.removeItem(STORAGE_KEY);
      });
  }, []);

  async function startAssessment() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/assessments", { method: "POST" });
      if (!response.ok) throw new Error("Unable to start QuickScan");
      const data = await response.json();
      setAssessmentId(data.id);
      window.localStorage.setItem(STORAGE_KEY, data.id);
    } catch {
      setError("We couldn't start the assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function saveAnswer(score: number) {
    if (!assessmentId || !question) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/assessments/${assessmentId}/responses/${question.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score }),
        },
      );

      if (!response.ok) throw new Error("Unable to save response");
      setAnswers((previous) => ({ ...previous, [question.id]: score }));
    } catch {
      setError("Your response could not be saved. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function next() {
    if (!currentAnswer) return;
    if (currentIndex < MIS_QUICKSCAN_QUESTIONS.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    if (!assessmentId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/assessments/${assessmentId}/complete`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "Unable to complete assessment");
      setResult(data.result);
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (completionError) {
      setError(
        completionError instanceof Error
          ? completionError.message
          : "We couldn't complete the assessment.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!assessmentId) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
            Stratova
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Mining Intelligence QuickScan™
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Discover how ready your organization is for data, digital transformation,
            spatial intelligence, and AI.
          </p>
          <button
            type="button"
            onClick={startAssessment}
            disabled={loading}
            className="mt-10 rounded-full bg-white px-7 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Starting…" : "Start Free Assessment"}
          </button>
          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}
        </div>
      </main>
    );
  }

  if (result) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Stratova</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Your QuickScan is complete</h1>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <p className="text-sm text-slate-400">Mining Intelligence Score</p>
              <p className="mt-3 text-6xl font-semibold">{result.overallScore}</p>
              <p className="mt-2 text-slate-300">out of 100</p>
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <p className="text-sm text-slate-400">Maturity</p>
              <p className="mt-3 text-3xl font-semibold">{result.maturity}</p>
              <p className="mt-2 text-slate-300">MIS {result.frameworkVersion}</p>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Stratova</p>
            <p className="mt-2 text-sm text-slate-400">
              Question {currentIndex + 1} of {MIS_QUICKSCAN_QUESTIONS.length}
            </p>
          </div>
          <span className="text-sm font-medium text-slate-400">{progress}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-wider text-sky-300">{question.dimension}</p>
          <h1 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">{question.question}</h1>
          <div className="mt-8 grid gap-3 sm:grid-cols-5">
            {SCORE_OPTIONS.map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => saveAnswer(score)}
                disabled={loading}
                className={`rounded-2xl border px-4 py-5 text-left transition ${
                  currentAnswer === score
                    ? "border-sky-300 bg-sky-300/15 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="block text-2xl font-semibold">{score}</span>
                <span className="mt-1 block text-xs text-slate-400">
                  {score === 1 ? "Very low" : score === 5 ? "Very high" : ""}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            disabled={currentIndex === 0 || loading}
            className="rounded-full border border-white/10 px-6 py-3 font-medium text-slate-300 transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!currentAnswer || loading}
            className="rounded-full bg-white px-7 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Saving…" : currentIndex === MIS_QUICKSCAN_QUESTIONS.length - 1 ? "See Results" : "Continue"}
          </button>
        </div>

        {error && <p className="mt-5 text-sm text-rose-300">{error}</p>}
      </div>
    </main>
  );
}
