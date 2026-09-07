"use client";

import { useEffect, useMemo, useState } from "react";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
type DeliveryStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE";

type Milestone = { id: string; name: string; dueDate: string; status: DeliveryStatus; risk: RiskLevel; };
type Risk = { id: string; title: string; level: RiskLevel; owner: string; mitigation: string; status?: string; };

export function ProjectDeliveryBoard({ projectId, targetEndDate }: { projectId: string; targetEndDate?: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState("");
  const [newDueDate, setNewDueDate] = useState(targetEndDate ?? "");
  const [riskTitle, setRiskTitle] = useState("");
  const [riskOwner, setRiskOwner] = useState("");
  const [riskMitigation, setRiskMitigation] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("MEDIUM");

  async function load() {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`/api/v1/consultant/projects/${projectId}/delivery`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to load delivery intelligence");
      setMilestones((payload.milestones ?? []).map((item: { id: string; name: string; dueDate?: string; due_date?: string; status: DeliveryStatus; riskLevel?: RiskLevel; risk_level?: RiskLevel }) => ({ id: item.id, name: item.name, dueDate: item.dueDate ?? item.due_date ?? "", status: item.status, risk: item.riskLevel ?? item.risk_level ?? "LOW" })));
      setRisks((payload.risks ?? []).map((item: { id: string; title: string; owner?: string; mitigation?: string; level: RiskLevel; status?: string }) => ({ id: item.id, title: item.title, owner: item.owner ?? "Unassigned", mitigation: item.mitigation ?? "Mitigation pending", level: item.level, status: item.status })));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load delivery intelligence"); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [projectId]);

  const delivery = useMemo(() => {
    const total = milestones.length;
    const done = milestones.filter((item) => item.status === "DONE").length;
    const highMilestones = milestones.filter((item) => item.risk === "HIGH").length;
    const highRisks = risks.filter((item) => item.level === "HIGH" && item.status !== "CLOSED").length;
    const overdue = milestones.filter((item) => item.dueDate && item.status !== "DONE" && new Date(item.dueDate).getTime() < Date.now()).length;
    const score = total ? Math.round((done / total) * 100) : 0;
    const health = highMilestones + highRisks > 0 ? "AT_RISK" : overdue > 0 ? "WATCH" : done === total && total > 0 ? "COMPLETE" : "ON_TRACK";
    return { done, total, highMilestones, highRisks, overdue, score, health };
  }, [milestones, risks]);

  async function createMilestone() {
    if (!newMilestone.trim()) return;
    setBusy(true); setError(null);
    try {
      const response = await fetch(`/api/v1/consultant/projects/${projectId}/delivery`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "milestone", name: newMilestone.trim(), dueDate: newDueDate || null }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to create milestone");
      setNewMilestone(""); setNewDueDate(targetEndDate ?? ""); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create milestone"); }
    finally { setBusy(false); }
  }

  async function addRisk() {
    if (!riskTitle.trim()) return;
    setBusy(true); setError(null);
    try {
      const response = await fetch(`/api/v1/consultant/projects/${projectId}/delivery`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "risk", title: riskTitle.trim(), owner: riskOwner.trim(), mitigation: riskMitigation.trim(), level: riskLevel }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to create risk");
      setRiskTitle(""); setRiskOwner(""); setRiskMitigation(""); setRiskLevel("MEDIUM"); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create risk"); }
    finally { setBusy(false); }
  }

  return <section className="mt-6 space-y-6">
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery intelligence</p><h2 className="mt-1 text-xl font-semibold">Project health: {loading ? "LOADING" : delivery.health}</h2><p className="mt-2 text-sm text-slate-500">{delivery.done}/{delivery.total} milestones complete · {delivery.score}% delivery progress</p></div><div className="grid grid-cols-3 gap-3 text-center"><Stat label="Overdue" value={delivery.overdue} /><Stat label="High risks" value={delivery.highRisks + delivery.highMilestones} /><Stat label="Progress" value={`${delivery.score}%`} /></div></div></div>

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">Milestones</h2><div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_140px]"><input value={newMilestone} onChange={(event) => setNewMilestone(event.target.value)} placeholder="New milestone" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><input type="date" value={newDueDate} onChange={(event) => setNewDueDate(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><button type="button" disabled={busy} onClick={() => void createMilestone()} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Add milestone</button></div><div className="mt-5 space-y-3">{milestones.length === 0 && !loading ? <p className="text-sm text-slate-500">No milestones recorded yet.</p> : milestones.map((item) => <div key={item.id} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_150px_150px]"><p className="font-medium">{item.name}</p><span className="text-sm text-slate-500">{item.dueDate || "No due date"}</span><span className="text-xs font-semibold">{item.status} · {item.risk}</span></div>)}</div></div>

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">Risk register</h2><p className="mt-2 text-sm text-slate-500">Capture blockers and mitigation actions affecting delivery.</p><div className="mt-5 grid gap-3 md:grid-cols-4"><input value={riskTitle} onChange={(event) => setRiskTitle(event.target.value)} placeholder="Risk or blocker" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><input value={riskOwner} onChange={(event) => setRiskOwner(event.target.value)} placeholder="Owner" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><select value={riskLevel} onChange={(event) => setRiskLevel(event.target.value as RiskLevel)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select><button type="button" disabled={busy} onClick={() => void addRisk()} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Add risk</button></div><textarea value={riskMitigation} onChange={(event) => setRiskMitigation(event.target.value)} placeholder="Mitigation action" className="mt-3 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /><div className="mt-5 space-y-3">{risks.length === 0 && !loading ? <p className="text-sm text-slate-500">No risks recorded.</p> : risks.map((risk) => <div key={risk.id} className="rounded-xl bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium">{risk.title}</p><span className="rounded-full bg-white px-2 py-1 text-xs font-semibold">{risk.level} · {risk.status ?? "OPEN"}</span></div><p className="mt-2 text-sm text-slate-500">Owner: {risk.owner}</p><p className="mt-1 text-sm text-slate-600">{risk.mitigation}</p></div>)}</div></div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </section>;
}

function Stat({ label, value }: { label: string; value: string | number }) { return <div className="rounded-xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }