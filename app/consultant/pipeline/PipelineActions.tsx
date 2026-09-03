"use client";

import { useState } from "react";

const transitions: Record<string, string[]> = {
  IDENTIFIED: ["QUALIFIED"],
  QUALIFIED: ["IDENTIFIED", "PROPOSED"],
  PROPOSED: ["QUALIFIED", "WON", "LOST"],
  WON: [],
  LOST: [],
};

export function PipelineActions({ opportunityId, stage }: { opportunityId: string; stage: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = transitions[stage] ?? [];

  if (!next.length) return null;

  async function move(nextStage: string) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/consultant/opportunities/${opportunityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: nextStage }),
      });
      if (!response.ok) throw new Error("Unable to update stage");
      window.location.reload();
    } catch {
      setError("Update failed");
      setBusy(false);
    }
  }

  return <div className="mt-3 flex flex-wrap gap-2">{next.map((nextStage) => <button key={nextStage} type="button" disabled={busy} onClick={() => move(nextStage)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-50">{busy ? "Saving…" : `→ ${nextStage}`}</button>)}{error && <span className="text-xs text-red-600">{error}</span>}</div>;
}
