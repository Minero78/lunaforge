export default function Loading() {
  return <main className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-4 w-32 rounded bg-slate-200" /><div className="mt-4 h-10 w-72 rounded bg-slate-200" /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 rounded-2xl bg-white" />)}</div></div></main>;
}
