import type { DeliveryHealth } from "@/lib/consulting/delivery-health";

export type OutcomeHealth = "ON_TARGET" | "WATCH" | "OFF_TARGET" | "ACHIEVED";
export type TransformationStatus = "HEALTHY" | "DELIVERY_INTERVENTION" | "VALUE_INTERVENTION" | "EXECUTIVE_ESCALATION" | "COMPLETE";

export function calculateOutcomeHealth(input: { totalOutcomes: number; achievedOutcomes: number; offTargetOutcomes: number; watchOutcomes: number }) {
  const progress = input.totalOutcomes ? Math.round((input.achievedOutcomes / input.totalOutcomes) * 100) : 0;
  const health: OutcomeHealth =
    input.offTargetOutcomes > 0 ? "OFF_TARGET" :
    input.watchOutcomes > 0 ? "WATCH" :
    input.totalOutcomes > 0 && input.achievedOutcomes === input.totalOutcomes ? "ACHIEVED" :
    "ON_TARGET";
  return { health, progress, interventionRequired: health === "OFF_TARGET" || health === "WATCH" };
}

export function calculateTransformationHealth(delivery: DeliveryHealth, outcome: OutcomeHealth): TransformationStatus {
  if (delivery === "COMPLETE" && outcome === "ACHIEVED") return "COMPLETE";
  const deliveryBad = delivery === "AT_RISK" || delivery === "WATCH";
  const outcomeBad = outcome === "OFF_TARGET" || outcome === "WATCH";
  if (deliveryBad && outcomeBad) return "EXECUTIVE_ESCALATION";
  if (deliveryBad) return "DELIVERY_INTERVENTION";
  if (outcomeBad) return "VALUE_INTERVENTION";
  return "HEALTHY";
}