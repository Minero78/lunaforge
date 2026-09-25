"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "../../lib/supabase/browser";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setBusy(false);
    if (result.error) return setMessage(result.error.message);
    setMessage(mode === "signin" ? "Signed in. Redirecting…" : "Account created. Check your email if confirmation is enabled.");
    if (mode === "signin") window.location.href = "/onboarding";
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Stratova</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-3 text-slate-400">Secure access to your mining intelligence workspace.</p>

        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {mode === "signup" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-400" />}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Business email" required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-400" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={8} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-400" />
          <button disabled={busy} className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
          {message && <p className="text-sm text-slate-300">{message}</p>}
        </form>

        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-5 text-sm text-sky-300 hover:text-sky-200">
          {mode === "signin" ? "Create a new account" : "I already have an account"}
        </button>
        <div className="mt-6"><Link href="/" className="text-sm text-slate-500 hover:text-slate-300">Back to Stratova</Link></div>
      </div>
    </main>
  );
}
