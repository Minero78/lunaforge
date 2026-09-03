"use client";

import { useState } from "react";

const transitions: Record<string, string[]> = {
  PLANNED: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["ON_HOLD", "COMPLETED", "CANCELLED"],
  ON_HOLD: ["ACTIVE", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function ProjectControls({ projectId, status, startDate, targetEndDate }: { projectId: string; status: string; startDate: string | null; targetEndDate: string | null }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [start, setStart] = useState(startDate ?? "");
  const [target, setTarget] = useState(targetEndDate ?? "");
  const next = transitions[status] ?? [];

  async function update(nextStatus: string) {
    if (start && target && target < start) { setMessage("Target end cannot precede start date."); return; }
    setBusy(true); setMessage(null);
    try {
      const response = await fetch(`/api/v1/consultant/projects/${projectId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus, startDate: start || null, targetEndDate: target || null }) });
      if (!response.ok) throw new Error();
      window.location.reload();
    } catch { setMessage("Unable to update project."); setBusy(false); }
  }

  if (!next.length) return <p className="mt-6 text-sm text-slate-500">This project is closed. Delivery controls are locked.</p>;

  return <div className="mt-6 space-y-5"><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Start date<input type="date" value={start} onChange={(event) => setStart(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target end<input type="date" value={target} onChange={(event) => setTarget(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label></div><div className="flex flex-wrap gap-2">{next.map((item) => <button key={item} type="button" disabled={busy} onClick={() => update(item)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50">{busy ? "Saving…" : `→ ${item}`}</button>)}</div>{message && <p className="text-xs text-red-600">{message}</p>}</div>;
}
