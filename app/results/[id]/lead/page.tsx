"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LeadCapturePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", company: "", jobTitle: "", country: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const response = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, assessmentId: params.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message ?? "Unable to submit your details.");
      router.push(`/results/${params.id}/report`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to submit your details.");
    } finally {
      setSaving(false);
    }
  }

  const field = (key: keyof typeof form, label: string, required = false, type = "text") => (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}{required ? " *" : ""}</span>
      <input
        required={required}
        type={type}
        value={form[key]}
        onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-sky-300/60"
      />
    </label>
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white sm:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Stratova</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Unlock your full assessment report</h1>
        <p className="mt-5 leading-8 text-slate-300">Tell us where to send the complete diagnostic view and recommendations. Your assessment is already complete.</p>

        <form onSubmit={submit} className="mt-10 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            {field("firstName", "First name", true)}
            {field("lastName", "Last name")}
            {field("email", "Business email", true, "email")}
            {field("company", "Company", true)}
            {field("jobTitle", "Job title")}
            {field("country", "Country")}
          </div>
          {error && <p className="rounded-xl border border-rose-300/20 bg-rose-300/5 p-4 text-sm text-rose-200">{error}</p>}
          <button disabled={saving} className="w-full rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-wait disabled:opacity-60">
            {saving ? "Preparing your report…" : "Continue to full report"}
          </button>
          <p className="text-center text-xs leading-5 text-slate-500">Assessment ID: {params.id}</p>
        </form>
      </div>
    </main>
  );
}
