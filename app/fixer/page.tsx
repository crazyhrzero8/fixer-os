"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CaseKind = "epfo-false-rejection" | "payment-tat-breach";
type CaseData = { id: string; kind: CaseKind; title: string; status: string; facts: Record<string, unknown>; events: { id: string; actor: string; type: string; ts: number; hash: string; payload: Record<string, unknown> }[] };
type Proof = { contradiction: boolean; domain: string; proofSteps: string[]; suggestedRouteAround: string; bugReport: string };
type Trace = { nodes: { id: string; office: string; designation: string; statutoryDeadlineDays: number; daysHeld: number; rule: string; breached: boolean }[]; blocker: { office: string; designation: string }; daysOverdue: number; tatCompensationAccrued: number; escalationLetter: string };
type CaseOption = { id: string; title: string; status: string };
type Preflight = { ruleId: string; status: "PASS" | "FAIL" | "WARN"; message: string; fix: string };
type Prov = { origin: string; secure: boolean; tier: "OFFICIAL" | "SANDBOX" | "UNKNOWN"; service: string | null; note: string };

const eventLabel = (value: string) => value.replaceAll("_", " ");
const factLine = (kind: CaseKind, facts: Record<string, unknown>) => {
  if (kind === "payment-tat-breach") return [
    ["TRANSACTION RRN", String(facts.rrn)],
    ["AMOUNT DEBITED", `₹${(Number(facts.amountPaise) / 100).toLocaleString("en-IN")}`],
    ["TICKET ISSUED", facts.ticketIssued ? "yes" : "no — service never delivered"]
  ];
  return [
    ["REQUESTED MEMBER ID", String(facts.nameAsPerEmployer)],
    ["PRIMARY UAN", String(facts.nameAsPerAadhaar)],
    ["BANK IFSC VALID", facts.bankIfscValid ? "yes" : "no"]
  ];
};

export default function Fixer() {
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [selected, setSelected] = useState("synthetic-epfo-001");
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [verified, setVerified] = useState(false);
  const [proof, setProof] = useState<Proof | null>(null);
  const [trace, setTrace] = useState<Trace | null>(null);
  const [preflight, setPreflight] = useState<Preflight[]>([]);
  const [provenance, setProvenance] = useState<Prov | null>(null);
  const [lastAction, setLastAction] = useState<{ action: string; summary: string; detail: string; mode?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load(caseId: string) {
    const [caseResponse, proofResponse, traceResponse] = await Promise.all([
      fetch(`/api/case/${caseId}`),
      fetch("/api/prove/pension"),
      fetch(`/api/traceroute?case=${caseId}`),
      fetch(`/api/preflight?case=${caseId}`)
    ]);
    if (caseResponse.ok) {
      const casePayload = await caseResponse.json();
      setCaseData(casePayload.case); setVerified(casePayload.verification?.valid === true);
    }
    setProof(await proofResponse.json()); setTrace(await traceResponse.json());
    setPreflight((await preflightResponse.json()).results ?? []);
  }
  useEffect(() => { void (async () => { const r = await fetch("/api/cases"); const p = await r.json(); setCases(p.cases); })(); }, []);
  useEffect(() => { void load(selected); }, [selected]);
  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch("/api/provenance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ caseId: selected, origin: window.location.origin }) });
        if (r.ok) setProvenance((await r.json()).verdict);
      } catch { /* provenance check is best-effort */ }
    })();
  }, [selected]);

  async function runStep() {
    setBusy(true);
    try {
      const response = await fetch("/api/agent/step", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ caseId: selected }) });
      const payload = await response.json();
      if (response.ok) { setLastAction(payload.result); setCaseData(payload.case); setVerified(payload.verification?.valid === true); }
      else setLastAction({ action: "ERROR", summary: "Request rejected", detail: payload.error ?? "Unknown error", mode: "deterministic" });
    } catch (e) { setLastAction({ action: "ERROR", summary: "Network error", detail: String(e), mode: "deterministic" }); }
    setBusy(false);
  }
  async function restart() {
    setBusy(true);
    await fetch(`/api/case/${selected}`, { method: "POST" });
    setLastAction(null); await load(selected); setBusy(false);
  }

  return <main className="min-h-screen bg-[#090b12] px-4 py-8 text-slate-100 sm:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div><p className="text-xs font-bold tracking-[0.24em] text-cyan-400 uppercase">FIXER.OS / Accountability console</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Audit the decision, not the citizen.</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Synthetic demonstration. The portal is untrusted; verified facts and every agent action are chained into independent evidence.</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-500">CASE
            <select value={selected} onChange={(e) => { setSelected(e.target.value); setLastAction(null); }} className="ml-2 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
              {(cases.length ? cases : [{ id: selected, title: selected, status: "" }]).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
          <Link href="/portal" className="rounded border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-cyan-400">Open mock portal</Link>
        </div>
      </header>
      {!caseData ? <p className="mt-10 text-slate-400">Loading case ledger…</p> : <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-slate-400">CASE {caseData.id}</p><h2 className="text-xl font-semibold">{caseData.title}</h2></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${caseData.status === "RESOLVED" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{caseData.status}</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">{factLine(caseData.kind, caseData.facts).map(([label, value]) => <div key={label} className="rounded bg-slate-950 p-3 text-sm"><p className="text-xs text-slate-500">{label}</p><b>{value}</b></div>)}</div>
            <p className="mt-3 text-xs text-emerald-400">{caseData.kind === "epfo-false-rejection" ? "Exact name match on record — the rejection is contradicted by independent facts." : "Debit confirmed, service never issued — codified RBI TAT entitlement applies."}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3"><button onClick={runStep} disabled={busy || caseData.status === "RESOLVED"} className="rounded bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50">{busy ? "Analyzing…" : "Run next agent step"}</button><button onClick={restart} disabled={busy} className="rounded border border-slate-700 px-4 py-2 text-sm hover:border-slate-400">Restart case</button><span className={`self-center text-xs ${verified ? "text-emerald-400" : "text-red-400"}`}>{verified ? `✓ Hash chain verified (${caseData.events.length} events)` : "Ledger verification failed"}</span></div>
            <div className="mt-4 flex items-center gap-2" aria-label="Agent progress">
              {["Interpret", "Draft", "File", "SLA", "Escalate"].map((label, idx) => {
                const done = caseData.status === "RESOLVED" || caseData.events.filter((e) => e.actor === "agent").length > idx;
                return <span key={label} className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${done ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300" : "border-slate-700 text-slate-500"}`}>{idx + 1}. {label}{done ? " ✓" : ""}</span>;
              })}
            </div>
            {lastAction && <div role="alert" className="mt-4 rounded border border-cyan-500/30 bg-cyan-500/10 p-3"><p className="text-xs font-bold text-cyan-300">{eventLabel(lastAction.action)}{lastAction.mode && <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${lastAction.mode === "llm" ? "bg-fuchsia-500/20 text-fuchsia-300" : "bg-slate-700/60 text-slate-300"}`}>{lastAction.mode === "llm" ? "LLM-DECIDED" : "DETERMINISTIC FALLBACK"}</span>}</p><p className="mt-1 font-semibold">{lastAction.summary}</p><p className="mt-1 text-sm text-slate-300">{lastAction.detail}</p></div>}
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5"><p className="text-xs font-bold tracking-widest text-emerald-300 uppercase">Rejection Wind-Tunnel / pre-flight simulation</p><h2 className="mt-1 text-xl font-semibold">Would this claim survive the department&apos;s own checks?</h2><div className="mt-4 space-y-2">{preflight.map((r) => <div key={r.ruleId} className={`rounded border p-3 text-sm ${r.status === "PASS" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : r.status === "WARN" ? "border-amber-500/40 bg-amber-500/10 text-amber-200" : "border-red-500/40 bg-red-500/10 text-red-200"}`}><b className="mr-2">{r.status}</b>{r.message}{r.fix && <p className="mt-1 text-xs opacity-80">Fix: {r.fix}</p>}</div>)}</div><p className="mt-3 text-xs text-slate-400">Predicted against the same validation classes that silently reject ~1 in 4 PF claims. Synthetic rules; real pattern.</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="font-semibold">Court-ready evidence timeline</h2><div className="mt-4 space-y-3 border-l border-slate-700 pl-4">{caseData.events.map((item) => <div key={item.id} className="relative"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-cyan-400" /><p className="text-xs text-slate-500">{item.actor.toUpperCase()} · {new Date(item.ts).toLocaleString()}</p><p className="text-sm font-semibold">{eventLabel(item.type)}</p><p className="mt-1 break-all font-mono text-[10px] text-slate-500">sha256 {item.hash}</p></div>)}</div></div>
          {proof && caseData.kind === "epfo-false-rejection" && <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-5"><p className="text-xs font-bold tracking-widest text-fuchsia-300 uppercase">RuleGuard / mechanically proven</p><h2 className="mt-1 text-xl font-semibold">No valid outcome exists for {proof.domain}</h2><ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-300">{proof.proofSteps.map((step) => <li key={step}>{step}</li>)}</ol><p className="mt-4 text-sm text-fuchsia-200">Route around: {proof.suggestedRouteAround}</p></div>}
        </section>
        <aside className="space-y-6">
          {trace && <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><p className="text-xs font-bold tracking-widest text-amber-300 uppercase">Kaun Zimmedar? / File traceroute</p><h2 className="mt-1 text-xl font-semibold">The blocking node is visible.</h2><div className="mt-5 space-y-2">{trace.nodes.map((node, index) => <div key={node.id}><div className={`rounded border p-3 ${node.breached ? "border-red-500/50 bg-red-500/10" : "border-slate-700 bg-slate-950"}`}><div className="flex justify-between gap-2"><b className="text-sm">{node.office}</b><span className={node.breached ? "text-xs text-red-300" : "text-xs text-slate-400"}>{node.breached ? "BREACHED" : "ESCALATION TARGET"}</span></div><p className="mt-1 text-xs text-slate-300">{node.designation} · held {node.daysHeld}d / deadline {node.statutoryDeadlineDays}d</p><p className="mt-1 text-[11px] text-slate-500">{node.rule}</p></div>{index < trace.nodes.length - 1 && <div className="ml-5 h-4 border-l border-slate-600" />}</div>)}</div><div className="mt-5 rounded bg-amber-500/10 p-3"><p className="text-xs text-amber-200">SLA CLOCK{caseData.kind === "payment-tat-breach" ? " · RBI TAT" : ""}</p><p className="text-2xl font-bold text-amber-300">₹{trace.tatCompensationAccrued.toLocaleString("en-IN")}</p><p className="text-xs text-slate-400">{trace.daysOverdue} overdue days × ₹100/day · synthetic demo calculator</p></div><details className="mt-4"><summary className="cursor-pointer text-sm text-cyan-300">View pre-addressed escalation draft</summary><pre className="mt-3 whitespace-pre-wrap rounded bg-slate-950 p-3 text-xs text-slate-300">{trace.escalationLetter}</pre><button type="button" onClick={() => { const blob = new Blob([trace.escalationLetter], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `escalation-${caseData.id}.txt`; a.click(); URL.revokeObjectURL(url); }} className="mt-2 rounded border border-slate-700 px-2 py-1 text-xs hover:border-cyan-400">Download letter (.txt)</button></details></div>}
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-5"><p className="text-xs font-bold tracking-widest text-sky-300 uppercase">Provenance verifier / is this portal genuine?</p><h2 className="mt-1 text-xl font-semibold">{provenance ? (provenance.tier === "OFFICIAL" ? "Official manifest match." : provenance.tier === "SANDBOX" ? "Registered sandbox origin." : "Untrusted origin.") : "Checking origin…"}</h2><div className="mt-3 space-y-1 text-sm text-slate-300">{provenance && <><p>Origin: <b className="break-all">{provenance.origin}</b></p><p>TLS secure: <b className={provenance.secure ? "text-emerald-400" : "text-red-400"}>{String(provenance.secure)}</b></p><p>Verdict written to ledger as PROVENANCE_VERIFIED.</p><p className="text-xs text-slate-400">{provenance.note}</p></>}</div><p className="mt-3 text-xs text-slate-400">Phishing clones are the top monetized attack on citizens (28 lakh+ cybercrime cases in 2025). Verification belongs in-flow, before any claim is filed.</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="font-semibold">What is real in this prototype?</h2><ul className="mt-3 space-y-2 text-sm text-slate-400"><li>✓ SHA-256 hash-chain verification per case</li><li>✓ LLM action-selection with strict schema + allow-list, deterministic fallback</li><li>✓ Server-owned portal sessions, request validation, rate limiting</li><li>✓ Interval-logic deadlock proof (EPFO rules)</li><li>✓ Codified RBI TAT compensation calculator (payment case)</li><li className="text-slate-500">◌ Portal, case facts, deadlines, and outcomes are synthetic; evidence store is per-process by design for this sandboxed demo.</li></ul></div>
        </aside>
      </div>}
    </div>
  </main>;
}
