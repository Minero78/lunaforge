export type LearningRecord = {
  title: string;
  urgency: string;
  baselineRiskScore: number | null;
  currentRiskScore: number | null;
};

export type PlaybookPerformance = {
  title: string;
  timesUsed: number;
  measurableUses: number;
  improvedUses: number;
  improvementRate: number | null;
  averageRiskReduction: number | null;
};

export function buildPlaybookPerformance(records: LearningRecord[]): PlaybookPerformance[] {
  const groups = new Map<string, LearningRecord[]>();
  for (const record of records) groups.set(record.title, [...(groups.get(record.title) ?? []), record]);

  return [...groups.entries()].map(([title, items]) => {
    const measurable = items.filter((item) => item.baselineRiskScore !== null && item.currentRiskScore !== null);
    const reductions = measurable.map((item) => (item.baselineRiskScore as number) - (item.currentRiskScore as number));
    const improved = reductions.filter((delta) => delta > 0);
    return {
      title,
      timesUsed: items.length,
      measurableUses: measurable.length,
      improvedUses: improved.length,
      improvementRate: measurable.length ? Math.round((improved.length / measurable.length) * 100) : null,
      averageRiskReduction: measurable.length ? Math.round(reductions.reduce((sum, value) => sum + value, 0) / measurable.length) : null,
    };
  }).sort((a, b) => (b.improvementRate ?? -1) - (a.improvementRate ?? -1));
}

export function selectBestLearnedPlaybook(performance: PlaybookPerformance[], minimumUses = 2) {
  return performance.find((item) => item.measurableUses >= minimumUses && item.improvementRate !== null && item.improvementRate >= 50) ?? null;
}