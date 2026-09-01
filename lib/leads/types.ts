export interface StratovaLeadInput {
  firstName: string;
  lastName?: string;
  email: string;
  company: string;
  jobTitle?: string;
  country?: string;
  assessmentId: string;
}

export interface StratovaLeadRecord extends StratovaLeadInput {
  id: string;
  createdAt: string;
}
