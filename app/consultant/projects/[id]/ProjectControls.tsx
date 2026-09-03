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
  const next = transitions[status] ?? [];

  async function update(nextStatus: string) {
    setBusy(true); setMessage(null);
    try {
      const response = await fetch(`/api/v1/consultant/projects/${projectId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus, startDate: startDate ?? null, targetEndDate: targetEndDate ?? null }) });
      if (!response.ok) throw new Error();
      window.location.reload();
    } catch { setMessage("Unable to update project."); setBusy(false); }
  }

  return <div className="mt-6"><div className="flex flex-wrap gap-2">{next.map((item) => <button key={item} disabled={busy} onClick={() => update(item)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50">{busy ? "Saving…" : `→ ${item}`}</button>)}</div>{message && <p className="mt-3 text-xs text-red-600">{message}</p>}</div>;
}
