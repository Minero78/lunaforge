"use client";

import { useEffect, useState } from "react";

type Action = {
  id: string;
  title: string;
  description: string | null;
  recommended_owner: string | null;
  assigned_to: string | null;
  urgency: string;
  status: string;
};

const statuses = ["RECOMMENDED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export function InterventionActionBoard() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/v1/consultant/intervention-actions", { cache: "no-store" });
    const payload = await response.json();
    setActions(payload.actions ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function update(id: string, status: string) {
    setBusy(id);
    await fetch("/api/v1/consultant/intervention-actions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    await load();
    setBusy(null);
  }

  if (loading) return <p className="mt-6 text-sm text-slate-500">Loading intervention actions…</p>;

  return <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 px-6 py-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Closed-loop execution</p><h2 className="mt-1 text-xl font-semibold">Accepted intervention actions</h2></div>
    <div className="divide-y divide-slate-100">
      {actions.length === 0 ? <p className="px-6 py-8 text-sm text-slate-500">No intervention actions have been accepted into execution yet.</p> : actions.map((action) =>
        <div key={action.id} className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div><p className="font-medium">{action.title}</p><p className="mt-1 text-sm text-slate-600">{action.description}</p><p className="mt-2 text-xs font-semibold text-slate-500">OWNER: {action.assigned_to ?? action.recommended_owner ?? "UNASSIGNED"} · URGENCY: {action.urgency}</p></div>
          <select value={action.status} disabled={busy === action.id} onChange={(event) => void update(action.id, event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      )}
    </div>
  </section>;
}