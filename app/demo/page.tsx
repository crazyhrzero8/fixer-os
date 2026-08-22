"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GovShell, btnOutline, cardCls } from "../govshell";

const alone = ["Captcha accepted", "PF advance submitted", "Under Process · day 7", "Rejected: name mismatch (false)", "Invalid tracking ID", "Next grievance allowed in 30 days", "STUCK — no accountable owner"];
const fixed = ["Import verified evidence", "Prove names match (ledger vs portal claim)", "Draft rebuttal from hash-chained facts", "Record grievance closure gap (invalid ID)", "Calculate ₹2,600 SLA accrual (pre-breach → breach)", "Trace Regional Office blocker (26d overdue)", "Escalation packet routed — RESOLVED"];

export default function Demo() {
  const [running, setRunning] = useState(false); const [left, setLeft] = useState(0); const [right, setRight] = useState(0); const [seconds, setSeconds] = useState(0); const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  function stop() { if (timer.current) clearInterval(timer.current); timer.current = null; setRunning(false); }
  function restart() { stop(); setLeft(0); setRight(0); setSeconds(0); setRunning(true); }
  useEffect(() => { if (!running) return; timer.current = setInterval(() => { setSeconds((value) => value + 1); setLeft((value) => Math.min(value + 1, alone.length)); setRight((value) => Math.min(value + 1, fixed.length)); }, 900); return stop; }, [running]);
  useEffect(() => { if (right >= fixed.length) stop(); }, [right]);
  useEffect(() => () => stop(), []);
  return (
    <GovShell active="/demo">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">FIXER.OS / Demo theater — deterministic synthetic playback</p>
          <h2 className="mt-1 text-2xl font-bold text-[#1a4b8e] sm:text-3xl">Same citizen. Two outcomes.</h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-600">A synthetic EPFO failure replayed twice: left as the portal leaves citizens, right as an evidence-owning counterparty resolves it. System font, light layout, reduced-motion safe.</p>
        </div>
        <Link href="/fixer" className={btnOutline}>Open the console</Link>
      </div>

      <div className={`${cardCls} flex flex-wrap items-center gap-3 p-3`}>
        <button onClick={restart} className="rounded-sm bg-[#1a4b8e] px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-[#123763]">{running ? "Restart playback" : "Run comparison"}</button>
        <button onClick={stop} disabled={!running} className={btnOutline + " disabled:opacity-40"}>Pause</button>
        <span className="font-mono text-[12px] text-slate-600">{String(seconds).padStart(2, "0")}s elapsed</span>
        <span className="text-[11px] text-slate-500">Left: portal owns status. Right: citizen owns evidence.</span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Citizen alone" subtitle="Portal owns the status, the evidence, and the clock — citizen tracks alone." tone="red" steps={alone} active={left} final="STUCK — grievance theater, no owner" />
        <Panel title="Citizen + FIXER.OS" subtitle="Independent evidence turns a false rejection into an accountable, named route." tone="blue" steps={fixed} active={right} final="RESOLVED — packet ready for RPFC/CPC" />
      </div>

      <div className={`${cardCls} mt-5 border-l-4 border-l-[#1a4b8e] p-4`}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">The novelty is the direction of verification</p>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-700">Most assistants check whether a <em>citizen</em> fits a rule. FIXER.OS checks whether the <em>state&apos;s decision</em> fits independently verified facts — then preserves the contradiction in a hash chain and names the overdue owner. That inversion is absent from Bhashini/UMANG/CPGRAMS dashboards as of Aug 22 2026.</p>
        <p className="mt-2 text-[11px] text-slate-500">Citations: RBI TAT DPSS.CO.PD No.629/2019-20 (₹100/day suo moto) · EPS 1995 §10 / EPS 2026 (10-yr rule, Gazette Jul 2026) · CPA 2019 §2(11) deficiency (Kangra Commission, 20 Jul 2026) · DPDP Act 2023 / Rules 13 Nov 2025 phased · GIGW 3.0 Dec 2023 · Prior art honestly cited: EPFO CITES 2.01 pre-validation (Jul 2026), Delhi e-SLA auto-compensation (2011), Catala/CUTECat rule-checking (France) — none hand the proof to the citizen.</p>
      </div>

      <div className={`${cardCls} mt-5 p-4`}>
        <h3 className="text-[13px] font-bold text-[#1a4b8e]">What judges test in 2 minutes — and where to click</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12px] leading-relaxed text-slate-700">
          <li><b>Minute 1 (citizen):</b> Press <i>Run comparison</i> — watch left stall at &ldquo;Next grievance in 30 days&rdquo; (documented EPFO lockout) while right chains 5 agent actions to RESOLVED.</li>
          <li><b>Minute 2 (builder):</b> Open <Link href="/fixer" className="underline text-[#1a4b8e]">Agent Console</Link> → pick <i>synthetic-irctc-001</i> for RBI TAT payment case (RRN + T+5 + ₹100/day) → run steps → download escalation letter.</li>
          <li>Trial credentials: UAN <b>100000000000</b> / <b>demo1234</b> on <Link href="/portal" className="underline text-[#1a4b8e]">Simulated Portal</Link>. No real data, no live govt system.</li>
        </ol>
      </div>
    </GovShell>
  );
}
function Panel({ title, subtitle, tone, steps, active, final }: { title: string; subtitle: string; tone: "red" | "blue"; steps: string[]; active: number; final: string }) {
  const completed = active >= steps.length;
  const frame = tone === "red" ? "border-red-200 bg-red-50/40" : "border-[#1a4b8e]/20 bg-[#eef3f9]";
  const dotActive = tone === "red" ? "bg-red-700 text-white" : "bg-[#1a4b8e] text-white";
  const heading = tone === "red" ? "text-red-800" : "text-[#1a4b8e]";
  return (
    <section className={`${cardCls} p-5 ${frame}`}>
      <p className={`text-[11px] font-bold uppercase tracking-widest ${heading}`}>{title}</p>
      <h3 className={`mt-1 text-[16px] font-bold ${completed ? heading : "text-slate-900"}`}>{completed ? final : active ? "Working…" : "Ready"}</h3>
      <p className="mt-1 min-h-10 text-[12px] leading-relaxed text-slate-600">{subtitle}</p>
      <div className="mt-4 space-y-2">
        {steps.map((step, index) => (
          <div key={step} className={`flex gap-3 rounded-sm border p-3 text-[12px] leading-relaxed ${index < active ? "border-slate-300 bg-white text-slate-900" : "border-slate-200 bg-white/60 text-slate-500"}`}>
            <span className={`mt-0 grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold ${index < active ? dotActive : "border border-slate-300 text-slate-400"}`}>{index < active ? "✓" : index + 1}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
