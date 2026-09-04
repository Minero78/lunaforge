"use client";

import { useState } from "react";

const transitions: Record<string, string[]> = { PLANNED: ["ACTIVE", "CANCELLED"], ACTIVE: ["ON_HOLD", "COMPLETED", "CANCELLED"], ON_HOLD: ["ACTIVE", "CANCELLED"], COMPLETED: [], CANCELLED: [] };

export function ProjectActions({ projectId, status }: { projectId: string; status: string }) {
  const [busy, setBusy] = useState(false);
  const options = transitions[status] ?? [];
  if (!options.length) return <p className="mt-5 text-xs text-slate-500">No further lifecycle transitions are available.</p>;
  async function move(nextStatus: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/v1/consultant/projects/${projectId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      if (!response.ok) throw new Error("PROJECT_UPDATE_FAILED");
      window.location.reload();
    } finally { setBusy(false); }
  }
  return <div className="mt-5 flex flex-wrap gap-2">{options.map((option) => <button key={option} type="button" disabled={busy} onClick={() => move(option)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50">{busy ? "Saving…" : option}</button>)}</div>;
}
