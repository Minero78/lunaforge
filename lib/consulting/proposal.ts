import type { ConsultingOpportunity } from "../intelligence/opportunities";
import type { RoadmapPhase } from "../intelligence/roadmap";

export type ProposalLineItem = {
  title: string;
  service: string;
  rationale: string;
  priority: ConsultingOpportunity["priority"];
  estimatedValue?: number;
};

export type ConsultingProposal = {
  title: string;
  executiveSummary: string;
  objectives: string[];
  scope: ProposalLineItem[];
  roadmap: RoadmapPhase[];
  assumptions: string[];
  nextSteps: string[];
  currency: string;
};

export type ProposalInput = {
  clientName: string;
  opportunities: ConsultingOpportunity[];
  roadmap: RoadmapPhase[];
  currency?: string;
};

export function buildConsultingProposal(input: ProposalInput): ConsultingProposal {
  const currency = input.currency ?? "USD";
  const highPriority = input.opportunities.filter((item) => item.priority === "HIGH");
  const scope = input.opportunities.map((item) => ({
    title: item.title,
    service: item.suggestedService,
    rationale: item.rationale,
    priority: item.priority,
  }));

  return {
    title: `Mining Intelligence Transformation Proposal — ${input.clientName}`,
    executiveSummary:
      `This proposal translates the current Mining Intelligence assessment into a focused transformation program for ${input.clientName}. ` +
      `The initial scope prioritizes ${highPriority.length} high-priority opportunity${highPriority.length === 1 ? "" : "ies"} and sequences implementation according to business impact and readiness.`,
    objectives: [
      "Establish a measurable baseline for mining intelligence maturity.",
      "Prioritize initiatives with clear operational and business value.",
      "Create an executable roadmap from assessment to implementation.",
      "Define a repeatable value-realization approach for technology investments.",
    ],
    scope,
    roadmap: input.roadmap,
    assumptions: [
      "Client provides access to relevant operational, engineering, spatial, and technology stakeholders.",
      "Implementation estimates are refined after technical discovery and data validation.",
      "Final commercial terms are confirmed through a statement of work.",
    ],
    nextSteps: [
      "Confirm priority opportunities and stakeholders.",
      "Conduct a focused discovery session for the selected scope.",
      "Finalize statement of work, timeline, deliverables, and commercial terms.",
    ],
    currency,
  };
}
