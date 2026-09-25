import { selectBestLearnedPlaybook, type PlaybookPerformance } from "@/lib/consulting/intervention-learning";

export function getAdaptiveRecommendation(staticTitle: string, performance: PlaybookPerformance[]) {
  const learned = selectBestLearnedPlaybook(performance);
  if (!learned) return { title: staticTitle, source: "RULE_BASED" as const, confidence: "LOW" as const };
  return {
    title: learned.title,
    source: "ORGANIZATIONAL_LEARNING" as const,
    confidence: learned.measurableUses >= 5 && (learned.improvementRate ?? 0) >= 70 ? "HIGH" as const : "MEDIUM" as const,
    evidence: { timesUsed: learned.timesUsed, improvementRate: learned.improvementRate, averageRiskReduction: learned.averageRiskReduction },
  };
}