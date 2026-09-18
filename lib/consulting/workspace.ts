import type { AssessmentRecord } from "@/lib/assessments/store";
import { deriveConsultingOpportunities, type ConsultingOpportunity } from "@/lib/intelligence/opportunities";
import { buildTransformationRoadmap } from "@/lib/intelligence/roadmap";

export function buildConsultantWorkspace(
  assessment: AssessmentRecord,
  persistedOpportunities?: ConsultingOpportunity[],
) {
  if (!assessment.result) {
    return { assessmentId: assessment.id, status: assessment.status, score: null, maturity: null, opportunities: [], roadmap: [] };
  }

  const opportunities = persistedOpportunities ?? deriveConsultingOpportunities(assessment.result);
  const roadmap = buildTransformationRoadmap(opportunities);

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
