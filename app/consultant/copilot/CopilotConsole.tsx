"use client";
import {useState} from "react";

export function CopilotConsole(){
 const [question,setQuestion]=useState("");
 const [result,setResult]=useState<any>(null);
 const [loading,setLoading]=useState(false);
 async function ask(value?:string){
  const q=value??question;if(!q.trim())return;
  setLoading(true);
  const response=await fetch("/api/v1/copilot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:q})});
  setResult(await response.json());setLoading(false);
 }
 const suggestions=["What requires my attention today?","What is the biggest portfolio risk?","What intervention should we take?","Give me an executive brief."];
 return <div className="rounded-2xl border bg-white shadow-sm"><div className="border-b px-6 py-5"><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Transformation Intelligence</p><h2 className="mt-1 text-xl font-semibold">Ask the Copilot</h2></div><div className="p-6"><div className="flex gap-3"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==="Enter"&&void ask()} placeholder="Ask about portfolio priorities, risks or interventions..." className="min-w-0 flex-1 rounded-xl border px-4 py-3"/><button onClick={()=>void ask()} disabled={loading} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white">{loading?"Analyzing…":"Ask"}</button></div><div className="mt-4 flex flex-wrap gap-2">{suggestions.map(s=><button key={s} onClick={()=>{setQuestion(s);void ask(s)}} className="rounded-full border px-3 py-2 text-xs hover:bg-slate-50">{s}</button>)}</div>{result&&<pre className="mt-6 whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm">{JSON.stringify(result.response?.answer??result,null,2)}</pre>}</div></div>;
}