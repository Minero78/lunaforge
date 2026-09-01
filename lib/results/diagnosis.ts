import type { MisDimensionResult, MisScoringResult } from "@/lib/mis/types";
import type {
  ResultInsight,
  ResultOpportunity,
  ResultRecommendation,
  StratovaResultDiagnosis,
} from "./types";

const LABELS: Record<string, string> = {
  engineering: "Engineering Intelligence",
  operations: "Operational Intelligence",
  data: "Data Foundation",
  spatial: "Spatial Intelligence",
  digital: "Digital Infrastructure",
  ai: "AI Readiness",
  value: "Value & Decision Intelligence",
};

const DESCRIPTIONS: Record<string, string> = {
  engineering: "Integration of engineering information, workflows, and technical decision support.",
  operations: "Use of operational information and connected workflows to support day-to-day decisions.",
  data: "Governance, accessibility, quality, and availability of critical mining data.",
  spatial: "Use of GIS, survey, drone, and spatial intelligence across mining workflows.",
  digital: "Digital infrastructure and interoperability across core technology systems.",
  ai: "Organizational readiness to identify, govern, and deploy practical AI use cases.",
  value: "Ability to translate digital and analytical capabilities into measurable decisions and outcomes.",
};

function insight(item: MisDimensionResult): ResultInsight {
  return {
    dimension: item.dimension,
    score: item.score,
    title: LABELS[item.dimension],
    description: DESCRIPTIONS[item.dimension],
  };
}

function opportunityFor(scores: Record<string, number>): ResultOpportunity {
  if (scores.spatial >= 70 && scores.digital < 70) {
    return {
      title: "Spatial Workflow Automation",
      description: "Connect strong spatial capabilities with digital workflows to reduce manual handoffs and accelerate operational decisions.",
      impact: "High",
      effort: "Medium",
      readiness: "High",
      priority: "Priority 1",
    };
  }

  if (scores.data < 60 && scores.ai < 60) {
    return {
      title: "Data Foundation for AI",
      description: "Strengthen data ownership, quality, accessibility, and governance before scaling AI initiatives.",
      impact: "High",
      effort: "Medium",
      readiness: "Medium",
      priority: "Priority 1",
    };
  }

  if (scores.operations < 60 && scores.digital >= 60) {
    return {
      title: "Connected Operations",
      description: "Translate digital infrastructure into integrated operational workflows and faster decision cycles.",
      impact: "High",
      effort: "Medium",
      readiness: "High",
      priority: "Priority 1",
    };
  }

  return {
    title: "Decision Intelligence Roadmap",
    description: "Prioritize the next set of data, digital, spatial, and AI initiatives around measurable business outcomes.",
    impact: "High",
    effort: "Medium",
    readiness: "Medium",
    priority: "Priority 1",
  };
}

function recommendationsFor(constraint: ResultInsight, opportunity: ResultOpportunity): ResultRecommendation[] {
  return [
    {
      title: `Baseline the ${constraint.title.toLowerCase()} capability`,
      rationale: "Establish a measurable baseline and identify the specific process, data, and technology constraints behind the score.",
      horizon: "0–90 days",
    },
    {
      title: `Pilot ${opportunity.title}`,
      rationale: `Test the highest-priority opportunity in a controlled workflow and quantify operational or financial impact before scaling.`,
      horizon: "3–6 months",
    },
    {
      title: "Build the transformation roadmap",
      rationale: "Sequence the next capabilities around dependencies, value, readiness, and organizational capacity.",
      horizon: "6–12 months",
    },
  ];
}

export function buildResultDiagnosis(result: MisScoringResult): StratovaResultDiagnosis {
  const ordered = [...result.dimensionScores].sort((a, b) => b.score - a.score);
  const lowest = [...result.dimensionScores].sort((a, b) => a.score - b.score)[0];
  const strongest = insight(ordered[0]);
  const developmentAreas = ordered.slice(-3).reverse().map(insight);
  const primaryConstraint = insight(lowest);
  const scores = Object.fromEntries(result.dimensionScores.map((item) => [item.dimension, item.score]));
  const opportunity = opportunityFor(scores);

  return {
    overallScore: result.overallScore,
    maturity: result.maturity,
    strongestCapability: strongest,
    developmentAreas,
    primaryConstraint,
    opportunity,
    recommendations: recommendationsFor(primaryConstraint, opportunity),
  };
}
