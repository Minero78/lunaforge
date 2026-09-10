import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/supabase/auth-context";
import { getPortfolioPredictiveIntelligence } from "@/lib/consulting/portfolio-predictive-intelligence";
import { buildPlaybookPerformance } from "@/lib/consulting/intervention-learning";

export default async function LearningPage() {
  const context = await getOrganizationContext();
  const supabase = await createSupabaseServerClient();
  const [{ data }, portfolio] = await Promise.all([
    supabase.from("intervention_actions").select("project_id,title,urgency,baseline_risk_score,status").eq("organization_id", context.organizationId).eq("status", "COMPLETED"),
    getPortfolioPredictiveIntelligence(),
  ]);
  const performance = buildPlaybookPerformance((data ?? []).map((action) => ({ title: action.title, urgency: action.urgency, baselineRiskScore: action.baseline_risk_score, currentRiskScore: portfolio.projects.find((p) => p.id === action.project_id)?.predictiveRiskScore ?? null })));
  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b bg-white"><div className="mx-auto flex max-w-7xl justify-between px-6 py-5"><Link href="/" className="font-semibold">STRATOVA</Link><Link href="/consultant/action-center" className="text-sm">Action Center</Link></div></header><div className="mx-auto max-w-7xl px-6 py-10"><p className="text-sm font-semibold uppercase tracking-widest text-indigo-700">Organizational learning</p><h1 className="mt-2 text-4xl font-semibold">Intervention Effectiveness</h1><div className="mt-8 overflow-hidden rounded-2xl border bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-4">Playbook</th><th className="px-6 py-4">Used</th><th className="px-6 py-4">Improvement rate</th><th className="px-6 py-4">Average risk reduction</th></tr></thead><tbody>{performance.map((p)=><tr key={p.title} className="border-t"><td className="px-6 py-4 font-medium">{p.title}</td><td className="px-6 py-4">{p.timesUsed}</td><td className="px-6 py-4">{p.improvementRate ?? "—"}{p.improvementRate !== null ? "%" : ""}</td><td className="px-6 py-4">{p.averageRiskReduction ?? "—"}</td></tr>)}{performance.length===0&&<tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">Complete interventions to build organizational learning data.</td></tr>}</tbody></table></div></div></main>;
}