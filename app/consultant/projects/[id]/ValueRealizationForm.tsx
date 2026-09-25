"use client";

import { FormEvent, useState } from "react";

type ValueCase = { investment: number; expected_annual_benefit: number; actual_annual_benefit: number | null; currency: string };

export function ValueRealizationForm({ opportunityId, valueCase }: { opportunityId: string; valueCase: ValueCase }) {
  const [actual, setActual] = useState(valueCase.actual_annual_benefit == null ? "" : String(valueCase.actual_annual_benefit));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (actual.trim() === "") return;
    const actualAnnualBenefit = Number(actual);
    if (!Number.isFinite(actualAnnualBenefit) || actualAnnualBenefit < 0) { setMessage("Enter a non-negative number."); return; }
    setBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/v1/value/roi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ opportunityId, investment: valueCase.investment, expectedAnnualBenefit: valueCase.expected_annual_benefit, actualAnnualBenefit, currency: valueCase.currency }) });
      if (!response.ok) throw new Error();
      window.location.reload();
    } catch { setMessage("Unable to save realized benefit."); setBusy(false); }
  }

  return <form onSubmit={submit} className="mt-5 border-t border-slate-200 pt-5"><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Actual annual benefit</label><div className="mt-2 flex gap-2"><input type="number" min="0" step="0.01" value={actual} onChange={(event) => setActual(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500" placeholder="Enter realized benefit" /><button disabled={busy || actual.trim() === ""} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save"}</button></div>{message && <p className="mt-2 text-xs text-red-600">{message}</p>}</form>;
}
