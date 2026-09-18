"use client";

import { useState } from "react";

export function OpportunityActions({ opportunityId, stage, title }: { opportunityId: string; stage: string; title: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  if (stage !== "WON") return null;

  async function createProject() {
    setBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/v1/consultant/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ opportunityId, name: title }) });
      const payload = await response.json() as { project?: { id: string }; error?: string };
      if (!response.ok || !payload.project) throw new Error(payload.error ?? "Unable to create project");
      window.location.href = `/consultant/projects/${payload.project.id}`;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create project.");
      setBusy(false);
    }
  }

  return <div className="mt-3"><button type="button" disabled={busy} onClick={createProject} className="rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Creating…" : "Create project"}</button>{message && <p className="mt-2 text-xs text-red-600">{message}</p>}</div>;
}
