"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const alone = ["Captcha accepted", "PF advance submitted", "Under Process · day 7", "Rejected: name mismatch", "Invalid tracking ID", "Next grievance allowed in 30 days", "STUCK — no accountable owner"];
const fixed = ["Import verified evidence", "Prove names match", "Draft rebuttal from ledger", "Record grievance closure gap", "Calculate ₹2,600 SLA accrual", "Trace Regional Office blocker", "Escalation packet routed", "RESOLVED"];

export default function Demo() {
  const [running, setRunning] = useState(false); const [left, setLeft] = useState(0); const [right, setRight] = useState(0); const [seconds, setSeconds] = useState(0); const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  function stop() { if (timer.current) clearInterval(timer.current); timer.current = null; setRunning(false); }
  function restart() { stop(); setLeft(0); setRight(0); setSeconds(0); setRunning(true); }
  useEffect(() => { if (!running) return; timer.current = setInterval(() => { setSeconds((value) => value + 1); setLeft((value) => Math.min(value + 1, alone.length)); setRight((value) => Math.min(value + 1, fixed.length)); }, 900); return stop; }, [running]);
  useEffect(() => { if (right >= fixed.length) stop(); }, [right]);
  useEffect(() => () => stop(), []);
  return <main className="min-h-screen bg-[#07090e] px-4 py-8 text-slate-100 sm:px-8"><div className="mx-auto max-w-6xl">
    <header className="flex flex-wrap justify-between gap-4 border-b border-slate-800 pb-6"><div><p className="text-xs font-bold tracking-[0.24em] text-cyan-400 uppercase">FIXER.OS / Demo theater</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Same citizen. Two outcomes.</h1><p className="mt-2 text-sm text-slate-400">A deterministic, synthetic playback of a hostile portal versus an evidence-owning counterparty.</p></div><Link href="/fixer" className="h-fit rounded border border-slate-700 px-3 py-2 text-sm hover:border-cyan-400">Open the console</Link></header>
    <div className="mt-6 flex flex-wrap items-center gap-4"><button onClick={restart} className="rounded bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950">{running ? "Restart playback" : "Run comparison"}</button><button onClick={stop} disabled={!running} className="rounded border border-slate-700 px-4 py-2 text-sm disabled:opacity-40">Pause</button><span className="font-mono text-sm text-slate-400">{String(seconds).padStart(2, "0")}s</span></div>
    <div className="mt-7 grid gap-6 lg:grid-cols-2"><Panel title="Citizen alone" subtitle="Portal owns the status, the evidence, and the clock." tone="red" steps={alone} active={left} final="STUCK"/><Panel title="Citizen + FIXER.OS" subtitle="Independent evidence turns failure into an accountable route." tone="cyan" steps={fixed} active={right} final="RESOLVED"/></div>
    <div className="mt-7 rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-5 text-sm text-slate-300"><b className="text-fuchsia-300">The novelty is the direction of verification:</b> most assistants check whether a citizen fits a rule. FIXER.OS checks whether the state&apos;s decision fits independently verified facts — then preserves the contradiction and names the overdue owner.</div>
  </div></main>;
}
function Panel({ title, subtitle, tone, steps, active, final }: { title: string; subtitle: string; tone: "red" | "cyan"; steps: string[]; active: number; final: string }) {
  const completed = active >= steps.length; const color = tone === "red" ? "border-red-500/40 bg-red-500/5 text-red-300" : "border-cyan-400/40 bg-cyan-400/5 text-cyan-200";
  return <section className={`rounded-xl border p-5 ${color}`}><p className="text-xs font-bold tracking-widest uppercase">{title}</p><h2 className="mt-2 text-2xl font-bold text-white">{completed ? final : active ? "Working…" : "Ready"}</h2><p className="mt-2 min-h-10 text-sm text-slate-400">{subtitle}</p><div className="mt-5 space-y-3">{steps.map((step, index) => <div key={step} className={`flex gap-3 rounded p-3 text-sm ${index < active ? "bg-slate-950/70 text-slate-100" : "bg-slate-950/20 text-slate-600"}`}><span className={`mt-0.5 grid h-5 w-5 place-items-center rounded-full text-xs ${index < active ? tone === "red" ? "bg-red-500 text-white" : "bg-cyan-400 text-slate-950" : "border border-slate-700"}`}>{index < active ? "✓" : index + 1}</span><span>{step}</span></div>)}</div></section>;
}
