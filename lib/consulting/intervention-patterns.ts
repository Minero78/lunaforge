export type InterventionPattern = {
  key: string;
  deliveryHealth: string;
  outcomeHealth: string;
  trend: string;
};

export function buildInterventionPattern(input: { deliveryHealth:string; outcomeHealth:string; trend:string }): InterventionPattern {
  return {
    key: [input.deliveryHealth,input.outcomeHealth,input.trend].join("::"),
    deliveryHealth: input.deliveryHealth,
    outcomeHealth: input.outcomeHealth,
    trend: input.trend,
  };
}

export function patternSimilarity(a: InterventionPattern, b: InterventionPattern) {
  let matches=0;
  if(a.deliveryHealth===b.deliveryHealth) matches++;
  if(a.outcomeHealth===b.outcomeHealth) matches++;
  if(a.trend===b.trend) matches++;
  return matches/3;
}