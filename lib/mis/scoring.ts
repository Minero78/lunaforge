import { MIS_QUICKSCAN_QUESTIONS } from "./questions";
import { resolveMaturity } from "./maturity";
import {
  MIS_ENGINE_VERSION,
  MIS_FRAMEWORK_VERSION,
  type MisQuestion,
  type MisResponse,
  type MisScore,
  type MisScoringResult,
} from "./types";

const SCORE_TO_PERCENT: Record<MisScore, number> = {
  1: 0,
  2: 25,
  3: 50,
  4: 75,
  5: 100,
};

export class MisScoringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MisScoringError";
  }
}

function assertValidScore(score: number): asserts score is MisScore {
  if (![1, 2, 3, 4, 5].includes(score)) {
    throw new MisScoringError(`Invalid MIS score: ${score}. Expected a value from 1 to 5.`);
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function validateResponses(questions: MisQuestion[], responses: MisResponse[]): void {
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const seen = new Set<string>();

  for (const response of responses) {
    if (seen.has(response.questionId)) {
      throw new MisScoringError(`Duplicate response for question: ${response.questionId}`);
    }
    seen.add(response.questionId);

    const question = questionMap.get(response.questionId);
    if (!question) {
      throw new MisScoringError(`Unknown MIS question: ${response.questionId}`);
    }

    if (!question.active) {
      throw new MisScoringError(`Question is inactive: ${response.questionId}`);
    }

    assertValidScore(response.score);
  }

  const requiredQuestions = questions.filter((question) => question.required && question.active);
  const missing = requiredQuestions
    .filter((question) => !seen.has(question.id))
    .map((question) => question.id);

  if (missing.length > 0) {
    throw new MisScoringError(`Missing required MIS questions: ${missing.join(", ")}`);
  }
}

export function normalizeMisScore(score: MisScore): number {
  return SCORE_TO_PERCENT[score];
}

export function calculateMisScore(
  responses: MisResponse[],
  questions: MisQuestion[] = MIS_QUICKSCAN_QUESTIONS,
): MisScoringResult {
  validateResponses(questions, responses);

  const responseMap = new Map(responses.map((response) => [response.questionId, response.score]));
  const activeQuestions = questions.filter((question) => question.active);

  const dimensionScores = MIS_DIMENSION_ORDER.map((dimension) => {
    const dimensionQuestions = activeQuestions.filter((question) => question.dimension === dimension);
    const weightedTotal = dimensionQuestions.reduce((total, question) => {
      const score = responseMap.get(question.id);
      if (score === undefined) {
        throw new MisScoringError(`Missing score for question: ${question.id}`);
      }
      return total + normalizeMisScore(score) * question.weight;
    }, 0);

    const totalWeight = dimensionQuestions.reduce((total, question) => total + question.weight, 0);
    const score = totalWeight === 0 ? 0 : round(weightedTotal / totalWeight);

    return {
      dimension,
      score,
      maturity: resolveMaturity(score),
    };
  });

  const overallWeight = activeQuestions.reduce((total, question) => total + question.weight, 0);
  const overallWeightedScore = activeQuestions.reduce((total, question) => {
    const score = responseMap.get(question.id);
    if (score === undefined) {
      throw new MisScoringError(`Missing score for question: ${question.id}`);
    }
    return total + normalizeMisScore(score) * question.weight;
  }, 0);

  const overallScore = overallWeight === 0 ? 0 : round(overallWeightedScore / overallWeight);

  return {
    frameworkVersion: MIS_FRAMEWORK_VERSION,
    engineVersion: MIS_ENGINE_VERSION,
    overallScore,
    maturity: resolveMaturity(overallScore),
    dimensionScores,
  };
}

const MIS_DIMENSION_ORDER: MisScoringResult["dimensionScores"][number]["dimension"][] = [
  "engineering",
  "operations",
  "data",
  "spatial",
  "digital",
  "ai",
  "value",
];
