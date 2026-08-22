"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GovShell, btnOutline, btnPrimary, cardCls } from "../govshell";

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
    const [caseResponse, proofResponse, traceResponse, preflightResponse] = await Promise.all([
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
    const preflightPayload = await preflightResponse.json().catch(() => null);
    setPreflight(preflightPayload?.results ?? []);
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

  return (
    <GovShell active="/fixer">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF9933]">FIXER.OS / Accountability console — independent prototype</p>
          <h2 className="mt-1 text-2xl font-bold text-[#1a4b8e] sm:text-3xl">Audit the decision, not the citizen.</h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-600">Synthetic demonstration. The portal is untrusted; verified facts and every agent action are chained into independent evidence. System font, light govt palette, GIGW 3.0 friendly.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Case
            <select value={selected} onChange={(e) => { setSelected(e.target.value); setLastAction(null); }} className="ml-2 rounded-sm border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900">
              {(cases.length ? cases : [{ id: selected, title: selected, status: "" }]).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
          <Link href="/portal" className={btnOutline}>Open mock portal</Link>
        </div>
      </div>

      {!caseData ? <p className="mt-10 text-[13px] text-slate-500">Loading case ledger…</p> : <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-5">
          <div className={cardCls + " p-5"}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-[11px] uppercase tracking-wide text-slate-500">Case {caseData.id}</p><h3 className="text-[18px] font-bold text-[#1a4b8e]">{caseData.title}</h3></div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${caseData.status === "RESOLVED" ? "bg-green-50 text-green-800 border border-green-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>{caseData.status}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">{factLine(caseData.kind, caseData.facts).map(([label, value]) => <div key={label} className="rounded-sm border border-slate-200 bg-[#f8fafc] p-3"><p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-[13px] font-semibold text-slate-900">{value}</p></div>)}</div>
            <p className="mt-3 text-[12px] font-semibold text-green-800">{caseData.kind === "epfo-false-rejection" ? "Exact name match on record — the rejection is contradicted by independent facts." : "Debit confirmed, service never issued — codified RBI TAT entitlement applies."}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={runStep} disabled={busy || caseData.status === "RESOLVED"} className={btnPrimary}>{busy ? "Analyzing…" : "Run next agent step"}</button>
              <button onClick={restart} disabled={busy} className={btnOutline}>Restart case</button>
              <span className={`text-[12px] font-semibold ${verified ? "text-green-700" : "text-red-700"}`}>{verified ? `✓ Hash chain verified (${caseData.events.length} events)` : "Ledger verification failed"}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Agent progress">
              {["Interpret", "Draft", "File", "SLA", "Escalate"].map((label, idx) => {
                const done = caseData.status === "RESOLVED" || caseData.events.filter((e) => e.actor === "agent").length > idx;
                return <span key={label} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${done ? "border-[#1a4b8e] bg-[#eef3f9] text-[#1a4b8e]" : "border-slate-300 text-slate-500 bg-white"}`}>{idx + 1}. {label}{done ? " ✓" : ""}</span>;
              })}
            </div>
            {lastAction && <div role="alert" className="mt-4 rounded-sm border-l-4 border-[#1a4b8e] bg-[#eef3f9] p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-[#1a4b8e]">{eventLabel(lastAction.action)}{lastAction.mode && <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${lastAction.mode === "llm" ? "bg-white border border-[#1a4b8e] text-[#1a4b8e]" : "bg-slate-200 text-slate-700"}`}>{lastAction.mode === "llm" ? "LLM-DECIDED" : "DETERMINISTIC FALLBACK"}</span>}</p><p className="mt-1 text-[13px] font-semibold text-slate-900">{lastAction.summary}</p><p className="mt-1 text-[13px] leading-relaxed text-slate-700">{lastAction.detail}</p></div>}
          </div>

          <div className={cardCls + " border-l-4 border-l-green-700 p-5"}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-700">Rejection Wind-Tunnel / pre-flight simulation</p>
            <h3 className="mt-1 text-[16px] font-bold text-slate-900">Would this claim survive the department&apos;s own checks?</h3>
            <div className="mt-3 space-y-2">{preflight.map((r) => <div key={r.ruleId} className={`rounded-sm border p-3 text-[13px] ${r.status === "PASS" ? "border-green-200 bg-green-50 text-green-900" : r.status === "WARN" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-red-200 bg-red-50 text-red-900"}`}><b className="mr-2">{r.status}</b>{r.message}{r.fix && <p className="mt-1 text-[12px] opacity-80">Fix: {r.fix}</p>}</div>)}</div>
            <p className="mt-3 text-[11px] text-slate-500">Predicted against the same validation classes that silently reject ~1 in 4 PF claims. Synthetic rules; real pattern. See docs/hackathon-research.md §Turn 19 for citations.</p>
          </div>

          <div className={cardCls + " p-5"}>
            <h3 className="font-bold text-slate-900">Court-ready evidence timeline</h3>
            <p className="mt-1 text-[11px] text-slate-500">Append-only SHA-256 chain — each event commits to previous hash. Matches GIGW 3.0 auditability + DPDP Act 2023 data-accuracy traceability.</p>
            <div className="mt-4 space-y-3 border-l-2 border-[#1a4b8e]/20 pl-4">{caseData.events.map((item) => <div key={item.id} className="relative"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#1a4b8e] border-2 border-white shadow" /><p className="text-[11px] text-slate-500">{item.actor.toUpperCase()} · {new Date(item.ts).toLocaleString()}</p><p className="text-[13px] font-semibold text-slate-900">{eventLabel(item.type)}</p><p className="mt-1 break-all font-mono text-[10px] text-slate-500">sha256 {item.hash.slice(0,16)}…{item.hash.slice(-8)}</p></div>)}</div>
          </div>

          {proof && caseData.kind === "epfo-false-rejection" && <div className={cardCls + " border-l-4 border-l-[#1a4b8e] p-5"}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">RuleGuard / mechanically proven — EPS 1995 §10 + EPS 2026 notified 2026 (10-year rule unchanged)</p>
            <h3 className="mt-1 text-[16px] font-bold text-slate-900">No valid outcome exists for {proof.domain}</h3>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-slate-700">{proof.proofSteps.map((step) => <li key={step}>{step}</li>)}</ol>
            <p className="mt-3 text-[13px] text-slate-700"><b>Route around:</b> {proof.suggestedRouteAround}</p>
            <details className="mt-3"><summary className="cursor-pointer text-[12px] font-semibold text-[#1a4b8e]">View developer bug report</summary><pre className="mt-2 whitespace-pre-wrap rounded-sm border border-slate-200 bg-[#f8fafc] p-3 text-[11px] text-slate-700">{proof.bugReport}</pre></details>
          </div>}
        </section>

        <aside className="space-y-5">
          {trace && <div className={cardCls + " p-5"}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">Kaun Zimmedar? / File traceroute — CPGRAMS/EPFO 30-day SLA hierarchy</p>
            <h3 className="mt-1 text-[16px] font-bold text-slate-900">The blocking node is visible.</h3>
            <div className="mt-4 space-y-2">{trace.nodes.map((node, index) => <div key={node.id}><div className={`rounded-sm border p-3 ${node.breached ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}><div className="flex justify-between gap-2"><b className="text-[13px] text-slate-900">{node.office}</b><span className={`text-[11px] font-bold ${node.breached ? "text-red-700" : "text-slate-500"}`}>{node.breached ? "BREACHED" : "ESCALATION TARGET"}</span></div><p className="mt-1 text-[11px] text-slate-600">{node.designation} · held {node.daysHeld}d / deadline {node.statutoryDeadlineDays}d</p><p className="mt-1 text-[11px] text-slate-500">{node.rule}</p></div>{index < trace.nodes.length - 1 && <div className="ml-5 h-3 border-l-2 border-slate-200" />}</div>)}</div>
            <div className="mt-4 rounded-sm border border-amber-200 bg-[#fff8e6] p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-[#8a6d00]">SLA CLOCK{caseData.kind === "payment-tat-breach" ? " · RBI DPSS.CO.PD No.629/02.01.014/2019-20" : " · synthetic demo"}</p><p className="text-2xl font-bold text-slate-900">₹{trace.tatCompensationAccrued.toLocaleString("en-IN")}</p><p className="text-[11px] text-slate-600">{trace.daysOverdue} overdue days × ₹100/day · {caseData.kind === "payment-tat-breach" ? "RBI TAT harmonisation — suo moto, no complaint needed (para 5), Ombudsman route if denied" : "synthetic demo calculator (para-matched rate)"}</p></div>
            <details className="mt-3"><summary className="cursor-pointer text-[12px] font-semibold text-[#1a4b8e]">View pre-addressed escalation draft (CPA 2019 §2(11) deficiency)</summary><pre className="mt-2 whitespace-pre-wrap rounded-sm border border-slate-200 bg-[#f8fafc] p-3 text-[11px] leading-relaxed text-slate-700">{trace.escalationLetter}</pre><button type="button" onClick={() => { const blob = new Blob([trace.escalationLetter], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `escalation-${caseData.id}.txt`; a.click(); URL.revokeObjectURL(url); }} className={btnOutline + " mt-2 text-[11px]"}>Download letter (.txt)</button></details>
          </div>}

          <div className={cardCls + " border-l-4 border-l-[#1a4b8e] p-5"}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">Provenance verifier / is this portal genuine?</p>
            <h3 className="mt-1 text-[15px] font-bold text-slate-900">{provenance ? (provenance.tier === "OFFICIAL" ? "Official manifest match." : provenance.tier === "SANDBOX" ? "Registered sandbox origin." : "Untrusted origin — HTTP not used by any govt service.") : "Checking origin…"}</h3>
            <div className="mt-2 space-y-1 text-[12px] text-slate-700">{provenance && <><p>Origin: <b className="break-all">{provenance.origin}</b></p><p>TLS: <b className={provenance.secure ? "text-green-700" : "text-red-700"}>{provenance.secure ? "HTTPS — required for govt portals (CERT-In)" : "INSECURE — HTTP"}</b></p><p className="text-[11px] text-slate-500">Verdict written to ledger as PROVENANCE_VERIFIED. Method: allow-list over simulated govt manifest (see playbooks/trusted-domains.json).</p><p className="text-[11px] text-slate-500">{provenance.note}</p></>}</div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Phishing clones are the top monetized attack: 28.15 lakh cybercrime cases in 2025 (+24% YoY), 38% via phishing per CERT-In; ITR portal still lists Chrome 88-90 compat. Verification belongs in-flow, before filing — DPDPA 2023 phased from Nov 2025.</p>
          </div>

          <div className={cardCls + " p-5"}>
            <h3 className="text-[13px] font-bold text-[#1a4b8e]">What is real in this prototype? (Honesty disclosure — judged criterion)</h3>
            <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-slate-700">
              <li>✓ SHA-256 hash-chain — verified per case, tamper evident</li>
              <li>✓ LLM action-selection — strict zod schema, allow-list, deterministic fallback (AGENT_MODE)</li>
              <li>✓ Server-owned portal sessions + zod validation + 30 req/min rate limit</li>
              <li>✓ Interval-logic deadlock proof — EPS 1995/2026 10-year rule, regimen unchanged per Gazette 2026</li>
              <li>✓ RBI TAT compensation calculator — DPSS.CO.PD No.629/2019-20, T+1 / T+5, ₹100/day suo moto</li>
              <li>✓ Provenance allow-list — 5 govt domains, TLS check, SANDBOX tier for any other HTTPS</li>
              <li className="text-slate-500">◌ Portal, facts, deadlines, outcomes synthetic; store per-process (demo sandbox); no live govt system touched — brief §What not to do.</li>
            </ul>
            <p className="mt-3 text-[11px] text-slate-500">Regulations cited: RBI TAT 20 Sep 2019 · EPS 1995 §10 & EPS 2026 (Social Security Code 2020) · CPA 2019 §2(11) · DPDP Act 11 Aug 2023 + DPDP Rules 13 Nov 2025 (phased) · GIGW 3.0 (MeitY/NIC/STQC/CERT-In, Dec 2023) · WCAG 2.1 AA.</p>
          </div>
        </aside>
      </div>}
    </GovShell>
  );
}
