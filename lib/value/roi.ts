export type RoiInput = {
  investment: number;
  expectedAnnualBenefit: number;
  actualAnnualBenefit?: number;
  currency?: string;
};

export type RoiResult = {
  investment: number;
  expectedAnnualBenefit: number;
  actualAnnualBenefit?: number;
  expectedRoiPercent: number;
  actualRoiPercent?: number;
  expectedPaybackMonths: number | null;
  actualPaybackMonths?: number | null;
  currency: string;
};

function roiPercent(benefit: number, investment: number): number {
  if (investment <= 0) return 0;
  return Number((((benefit - investment) / investment) * 100).toFixed(1));
}

function paybackMonths(benefit: number, investment: number): number | null {
  if (investment <= 0 || benefit <= 0) return null;
  return Number(((investment / benefit) * 12).toFixed(1));
}

export function calculateRoi(input: RoiInput): RoiResult {
  return {
    investment: input.investment,
    expectedAnnualBenefit: input.expectedAnnualBenefit,
    actualAnnualBenefit: input.actualAnnualBenefit,
    expectedRoiPercent: roiPercent(input.expectedAnnualBenefit, input.investment),
    actualRoiPercent:
      input.actualAnnualBenefit === undefined ? undefined : roiPercent(input.actualAnnualBenefit, input.investment),
    expectedPaybackMonths: paybackMonths(input.expectedAnnualBenefit, input.investment),
    actualPaybackMonths:
      input.actualAnnualBenefit === undefined ? undefined : paybackMonths(input.actualAnnualBenefit, input.investment),
    currency: input.currency ?? "USD",
  };
}
