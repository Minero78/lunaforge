import type { StratovaLeadInput, StratovaLeadRecord } from "./types";

const leads = new Map<string, StratovaLeadRecord>();

export function createLead(input: StratovaLeadInput): StratovaLeadRecord {
  const existing = [...leads.values()].find(
    (lead) => lead.email.toLowerCase() === input.email.toLowerCase(),
  );

  if (existing) return existing;

  const lead: StratovaLeadRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  leads.set(lead.id, lead);
  return lead;
}
