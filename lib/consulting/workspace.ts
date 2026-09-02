import type { AssessmentRecord } from "@/lib/assessments/store";
import { deriveConsultingOpportunities } from "@/lib/intelligence/opportunities";
import { buildRoadmap } from "@/lib/intelligence/roadmap";

export function buildConsultantWorkspace(assessment: AssessmentRecord) {
  if (!assessment.result) {
    return { assessmentId: assessment.id, status: assessment.status, score: null, maturity: null, opportunities: [], roadmap: [] };
  }

  const opportunities = deriveConsultingOpportunities(assessment.result);
  const roadmap = buildRoadmap(opportunities);

  return {
    assessmentId: assessment.id,
    status: assessment.status,
    score: assessment.result.overallScore,
    maturity: assessment.result.maturity,
    dimensions: assessment.result.dimensionScores,
    opportunities,
    roadmap,
  };
}
