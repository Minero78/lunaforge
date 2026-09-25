export type InterventionAction = {
  status?: string;
  severity?: string;
  effectiveness_score?: number;
};

export function learnFromInterventions(actions: InterventionAction[]) {
  const completed = actions.filter(
    (action) => action.status === "COMPLETED" && typeof action.effectiveness_score === "number",
  );
  const average = completed.length
    ? completed.reduce((sum, action) => sum + (action.effectiveness_score ?? 0), 0) / completed.length
    : 0;

  const bySeverity = Object.fromEntries(
    ["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((severity) => {
      const matches = completed.filter((action) => action.severity === severity);
      const value = matches.length
        ? matches.reduce((sum, action) => sum + (action.effectiveness_score ?? 0), 0) / matches.length
        : 0;
      return [severity, value];
    }),
  );

  return {
    sampleSize: completed.length,
    averageEffectiveness: Math.round(average),
    bySeverity,
  };
}
