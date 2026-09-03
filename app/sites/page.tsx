"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Site = { id: string; name: string; code: string | null; location: string | null };

async function fetchSites() {
  const response = await fetch("/api/v1/organizations/sites");
  const body = await response.json();
  return { response, body };
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchSites().then(({ response, body }) => {
      if (cancelled) return;
      if (response.ok) setSites(body.sites ?? []);
      else setMessage(body.error?.message ?? "Unable to load sites.");
    });
    return () => { cancelled = true; };
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/v1/organizations/sites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, code, location }) });
    const body = await response.json();
    if (!response.ok) return setMessage(body.error?.message ?? "Unable to create site.");
    setName(""); setCode(""); setLocation("");
    const refreshed = await fetchSites();
    if (refreshed.response.ok) setSites(refreshed.body.sites ?? []);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><Link href="/" className="font-semibold">STRATOVA</Link><Link href="/workspace" className="text-sm text-slate-500">Workspace</Link></div></header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Operations</p>
        <h1 className="mt-2 text-3xl font-semibold">Sites</h1>
        <p className="mt-2 text-slate-500">Manage the operating sites that form the foundation of your mining intelligence program.</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <form onSubmit={create} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">Add site</h2><div className="mt-5 space-y-3"><input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Site name" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"/><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Site code" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"/><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-sky-500"/><button className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white">Add site</button>{message && <p className="text-sm text-slate-500">{message}</p>}</div></form>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">Operating sites</h2>{sites.length === 0 ? <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No sites yet. Add your first operating site.</div> : <div className="mt-5 space-y-3">{sites.map((site) => <div key={site.id} className="rounded-xl border border-slate-200 p-4"><div className="font-medium">{site.name}</div><div className="mt-1 text-sm text-slate-500">{site.code ?? "No code"}{site.location ? ` · ${site.location}` : ""}</div></div>)}</div>}</section>
        </div>
      </div>
    </main>
  );
}
