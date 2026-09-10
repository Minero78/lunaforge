export type RecommendationConfidence = "INSUFFICIENT_DATA" | "LOW" | "MEDIUM" | "HIGH";

export function calculateRecommendationConfidence(input:{measurableUses:number; improvementRate:number|null}):RecommendationConfidence {
  if(input.measurableUses===0) return "INSUFFICIENT_DATA";
  if(input.measurableUses<3) return "LOW";
  if(input.measurableUses<6 || (input.improvementRate??0)<70) return "MEDIUM";
  return "HIGH";
}