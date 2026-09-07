"use client";

import { useMemo, useState } from "react";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
type DeliveryStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE";

type Milestone = {
  id: string;
  name: string;
  dueDate: string;
  status: DeliveryStatus;
  risk: RiskLevel;
};

type Risk = {
  id: string;
  title: string;
  level: RiskLevel;
  owner: string;
  mitigation: string;
};

const initialMilestones: Milestone[] = [
  { id: "kickoff", name: "Project kickoff and mobilization", dueDate: "", status: "NOT_STARTED", risk: "LOW" },
  { id: "diagnostic", name: "Diagnostic validation", dueDate: "", status: "NOT_STARTED", risk: "LOW" },
  { id: "implementation", name: "Transformation implementation", dueDate: "", status: "NOT_STARTED", risk: "MEDIUM" },
  { id: "benefits", name: "Benefits realization review", dueDate: "", status: "NOT_STARTED", risk: "MEDIUM" },
];

export function ProjectDeliveryBoard({ targetEndDate }: { targetEndDate?: string }) {
  const [milestones, setMilestones] = useState(initialMilestones.map((item) => ({ ...item, dueDate: targetEndDate ?? "" })));
  const [risks, setRisks] = useState<Risk[]>([]);
  const [riskTitle, setRiskTitle] = useState("");
  const [riskOwner, setRiskOwner] = useState("");
  const [riskMitigation, setRiskMitigation] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("MEDIUM");

  const delivery = useMemo(() => {
    const total = milestones.length;
    const done = milestones.filter((item) => item.status === "DONE").length;
    const highMilestones = milestones.filter((item) => item.risk === "HIGH").length;
    const highRisks = risks.filter((item) => item.level === "HIGH").length;
    const overdue = milestones.filter((item) => item.dueDate && item.status !== "DONE" && new Date(item.dueDate).getTime() < Date.now()).length;
    const score = total ? Math.round((done / total) * 100) : 0;
    const health = highMilestones + highRisks > 0 ? "AT_RISK" : overdue > 0 ? "WATCH" : done === total && total > 0 ? "COMPLETE" : "ON_TRACK";
    return { done, total, highMilestones, highRisks, overdue, score, health };
  }, [milestones, risks]);

  function updateMilestone(id: string, patch: Partial<Milestone>) {
    setMilestones((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function addRisk() {
    if (!riskTitle.trim()) return;
    setRisks((items) => [...items, { id: crypto.randomUUID(), title: riskTitle.trim(), owner: riskOwner.trim() || "Unassigned", mitigation: riskMitigation.trim() || "Mitigation pending", level: riskLevel }]);
    setRiskTitle(""); setRiskOwner(""); setRiskMitigation(""); setRiskLevel("MEDIUM");
  }

  return <section className="mt-6 space-y-6">
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery intelligence</p><h2 className="mt-1 text-xl font-semibold">Project health: {delivery.health}</h2><p className="mt-2 text-sm text-slate-500">{delivery.done}/{delivery.total} milestones complete · {delivery.score}% delivery progress</p></div><div className="grid grid-cols-3 gap-3 text-center"><Stat label="Overdue" value={delivery.overdue} /><Stat label="High risks" value={delivery.highRisks + delivery.highMilestones} /><Stat label="Progress" value={`${delivery.score}%`} /></div></div>
    </div>

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">Milestones</h2><div className="mt-5 space-y-3">{milestones.map((item) => <div key={item.id} className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_150px_150px_130px]"><div><p className="font-medium">{item.name}</p></div><input type="date" value={item.dueDate} onChange={(event) => updateMilestone(item.id, { dueDate: event.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><select value={item.status} onChange={(event) => updateMilestone(item.id, { status: event.target.value as DeliveryStatus })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="NOT_STARTED">Not started</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option></select><select value={item.risk} onChange={(event) => updateMilestone(item.id, { risk: event.target.value as RiskLevel })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="LOW">Low risk</option><option value="MEDIUM">Medium risk</option><option value="HIGH">High risk</option></select></div>)}</div></div>

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">Risk register</h2><p className="mt-2 text-sm text-slate-500">Capture blockers and mitigation actions affecting delivery.</p><div className="mt-5 grid gap-3 md:grid-cols-4"><input value={riskTitle} onChange={(event) => setRiskTitle(event.target.value)} placeholder="Risk or blocker" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><input value={riskOwner} onChange={(event) => setRiskOwner(event.target.value)} placeholder="Owner" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><select value={riskLevel} onChange={(event) => setRiskLevel(event.target.value as RiskLevel)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select><button type="button" onClick={addRisk} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Add risk</button></div><textarea value={riskMitigation} onChange={(event) => setRiskMitigation(event.target.value)} placeholder="Mitigation action" className="mt-3 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /><div className="mt-5 space-y-3">{risks.length === 0 ? <p className="text-sm text-slate-500">No risks recorded.</p> : risks.map((risk) => <div key={risk.id} className="rounded-xl bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium">{risk.title}</p><span className="rounded-full bg-white px-2 py-1 text-xs font-semibold">{risk.level}</span></div><p className="mt-2 text-sm text-slate-500">Owner: {risk.owner}</p><p className="mt-1 text-sm text-slate-600">{risk.mitigation}</p></div>)}</div></div>
  </section>;
}

function Stat({ label, value }: { label: string; value: string | number }) { return <div className="rounded-xl bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }