import { ResultsDashboard } from "./ResultsDashboard";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  return <ResultsDashboard assessmentId={id} />;
}
