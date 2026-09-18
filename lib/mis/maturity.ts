import type { MisMaturity } from "./types";

export function resolveMaturity(score: number): MisMaturity {
  if (score <= 20) return "Fragmented";
  if (score <= 40) return "Structured";
  if (score <= 60) return "Connected";
  if (score <= 80) return "Intelligent";
  return "Adaptive";
}
