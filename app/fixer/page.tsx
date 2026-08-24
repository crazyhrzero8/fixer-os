"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GovShell, btnOutline, btnPrimary, cardCls } from "../govshell";
import { useLang, t, DICT } from "@/lib/i18n";

type CaseKind = "epfo-false-rejection" | "payment-tat-breach";
type CaseData = { id: string; kind: CaseKind; title: string; status: string; facts: Record<string, unknown>; events: { id: string; actor: string; type: string; ts: number; hash: string; payload: Record<string, unknown> }[] };
type Proof = { contradiction: boolean; domain: string; proofSteps: string[]; suggestedRouteAround: string; bugReport: string };
type Trace = { nodes: { id: string; office: string; designation: string; statutoryDeadlineDays: number; daysHeld: number; rule: string; breached: boolean }[]; blocker: { office: string; designation: string }; daysOverdue: number; tatCompensationAccrued: number; escalationLetter: string };
type CaseOption = { id: string; title: string; status: string };
type Preflight = { ruleId: string; status: "PASS" | "FAIL" | "WARN"; message: string; fix: string };
type Prov = { origin: string; secure: boolean; tier: "OFFICIAL" | "SANDBOX" | "UNKNOWN"; service: string | null; note: string };

const eventLabel = (value: string) => value.replaceAll("_", " ");
const boldParts = (s: string) => s.split("**").map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
const factLine = (kind: CaseKind, lang: "en"|"hi", facts: Record<string, unknown>) => {
  const yes = t(lang, "yesLbl"), no = t(lang, "noLbl");
  if (kind === "payment-tat-breach") return [
    [lang === "hi" ? "लेन-देन RRN" : "TRANSACTION RRN", String(facts.rrn)],
    [lang === "hi" ? "कटी राशि" : "AMOUNT DEBITED", `₹${(Number(facts.amountPaise) / 100).toLocaleString("en-IN")}`],
    [lang === "hi" ? "टिकट जारी" : "TICKET ISSUED", facts.ticketIssued ? yes : t(lang, "tatNoTicket")]
  ];
  return [
    [lang === "hi" ? "सदस्य आईडी (अनुरोधित)" : "REQUESTED MEMBER ID", String(facts.nameAsPerEmployer)],
    [lang === "hi" ? "प्राथमिक UAN" : "PRIMARY UAN", String(facts.nameAsPerAadhaar)],
    [lang === "hi" ? "बैंक IFSC वैध" : "BANK IFSC VALID", facts.bankIfscValid ? yes : no]
  ];
};

export default function Fixer() {
  const { lang } = useLang();
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
      else setLastAction({ action: "ERROR", summary: t(lang,"errRejected"), detail: payload.error ?? t(lang,"errNet"), mode: "deterministic" });
    } catch (e) { setLastAction({ action: "ERROR", summary: t(lang,"errNet"), detail: String(e), mode: "deterministic" }); }
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
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">{t(lang,"fixEyebrow")}</p>
          <h2 className="mt-1 text-2xl font-bold text-[#1a4b8e] sm:text-3xl">{t(lang,"fixTitle")}</h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-600">{t(lang,"fixSub")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-600">{t(lang,"caseLbl")}
            <select value={selected} onChange={(e) => { setSelected(e.target.value); setLastAction(null); }} className="ml-2 rounded-sm border border-slate-300 bg-white px-3 py-2 text-[13px] text-slate-900">
              {(cases.length ? cases : [{ id: selected, title: selected, status: "" }]).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
          <Link href="/portal" className={btnOutline}>{t(lang,"openMock")}</Link>
        </div>
      </div>

      {!caseData ? <p className="mt-10 text-[13px] text-slate-500">{t(lang,"loadingLedger")}</p> : <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-5">
          <div className={cardCls + " p-5"}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-[11px] uppercase tracking-wide text-slate-500">Case {caseData.id}</p><h3 className="text-[18px] font-bold text-[#1a4b8e]">{caseData.title}</h3></div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${caseData.status === "RESOLVED" ? "bg-green-50 text-green-800 border border-green-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>{caseData.status}</span>
            </div>
            {caseData.kind === "epfo-false-rejection"
              ? <p className="mt-1 text-[11px] font-semibold text-[#8a6d00]">{t(lang,"problemTag")}</p>
              : <p className="mt-1 text-[11px] font-semibold text-[#8a6d00]">{t(lang,"generalityTag")}</p>}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">{factLine(caseData.kind, lang, caseData.facts).map(([label, value]) => <div key={label} className="rounded-sm border border-slate-200 bg-[#f8fafc] p-3"><p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-[13px] font-semibold text-slate-900">{value}</p></div>)}</div>
            <p className="mt-3 text-[12px] font-semibold text-green-800">{caseData.kind === "epfo-false-rejection" ? t(lang,"nameProofLine") : t(lang,"tatProofLine")}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={runStep} disabled={busy || caseData.status === "RESOLVED"} className={btnPrimary}>{busy ? t(lang,"analyzing") : t(lang,"consoleRunStep")}</button>
              <button onClick={restart} disabled={busy} className={btnOutline}>{t(lang,"consoleRestart")}</button>
              <span className={`text-[12px] font-semibold ${verified ? "text-green-700" : "text-red-700"}`}>{verified ? `${t(lang,"chainVerified")} (${caseData.events.length})` : t(lang,"ledgerFail")}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Agent progress">
              {(DICT[lang].chips ?? DICT.en.chips).map((label, idx) => {
                const done = caseData.status === "RESOLVED" || caseData.events.filter((e) => e.actor === "agent").length > idx;
                return <span key={label} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${done ? "border-[#1a4b8e] bg-[#eef3f9] text-[#1a4b8e]" : "border-slate-300 text-slate-500 bg-white"}`}>{idx + 1}. {label}{done ? " ✓" : ""}</span>;
              })}
            </div>
            {lastAction && <div role="alert" className="mt-4 rounded-sm border-l-4 border-[#1a4b8e] bg-[#eef3f9] p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-[#1a4b8e]">{eventLabel(lastAction.action)}{lastAction.mode && <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${lastAction.mode === "llm" ? "bg-white border border-[#1a4b8e] text-[#1a4b8e]" : "bg-slate-200 text-slate-700"}`}>{lastAction.mode === "llm" ? "LLM-DECIDED" : "DETERMINISTIC FALLBACK"}</span>}</p><p className="mt-1 text-[13px] font-semibold text-slate-900">{lastAction.summary}</p><p className="mt-1 text-[13px] leading-relaxed text-slate-700">{lastAction.detail}</p></div>}
          </div>

          <div className={cardCls + " border-l-4 border-l-green-700 p-5"}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-700">{t(lang,"windTunnelEyebrow")}</p>
            <h3 className="mt-1 text-[16px] font-bold text-slate-900">{t(lang,"windTunnelHead")}</h3>
            <div className="mt-3 space-y-2">{preflight.map((r) => <div key={r.ruleId} className={`rounded-sm border p-3 text-[13px] ${r.status === "PASS" ? "border-green-200 bg-green-50 text-green-900" : r.status === "WARN" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-red-200 bg-red-50 text-red-900"}`}><b className="mr-2">{r.status}</b>{r.message}{r.fix && <p className="mt-1 text-[12px] opacity-80">Fix: {r.fix}</p>}</div>)}</div>
            <p className="mt-3 text-[11px] text-slate-500">{t(lang,"wtFoot")}</p>
          </div>

          <div className={cardCls + " p-5"}>
            <h3 className="font-bold text-slate-900">{t(lang,"timelineHead")}</h3>
            <p className="mt-1 text-[11px] text-slate-500">{t(lang,"tlDesc")}</p>
            <div className="mt-4 space-y-3 border-l-2 border-[#1a4b8e]/20 pl-4">{caseData.events.map((item) => <div key={item.id} className="relative"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#1a4b8e] border-2 border-white shadow" /><p className="text-[11px] text-slate-500">{item.actor.toUpperCase()} · {new Date(item.ts).toLocaleString()}</p><p className="text-[13px] font-semibold text-slate-900">{eventLabel(item.type)}</p><p className="mt-1 break-all font-mono text-[10px] text-slate-500">sha256 {item.hash.slice(0,16)}…{item.hash.slice(-8)}</p></div>)}</div>
          </div>

          {proof && caseData.kind === "epfo-false-rejection" && <div className={cardCls + " border-l-4 border-l-[#1a4b8e] p-5"}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">{t(lang,"ruleguardEyebrow")} — EPS 1995 §10 + EPS 2026 (Gazette 2026, 10-yr rule unchanged)</p>
            <h3 className="mt-1 text-[16px] font-bold text-slate-900">{lang === "hi" ? <>{proof.domain} {t(lang,"rgLead")}</> : <>{t(lang,"rgLead")} {proof.domain}</>}</h3>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-slate-700">{proof.proofSteps.map((step) => <li key={step}>{step}</li>)}</ol>
            <p className="mt-3 text-[13px] text-slate-700"><b>{t(lang,"routeAround")}</b> {proof.suggestedRouteAround}</p>
            <details className="mt-3"><summary className="cursor-pointer text-[12px] font-semibold text-[#1a4b8e]">{t(lang,"viewBugReport")}</summary><pre className="mt-2 whitespace-pre-wrap rounded-sm border border-slate-200 bg-[#f8fafc] p-3 text-[11px] text-slate-700">{proof.bugReport}</pre></details>
          </div>}
        </section>

        <aside className="space-y-5">
          {trace && <div className={cardCls + " p-5"}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">{t(lang,"tracerouteEyebrow")} — {t(lang,"trSub")}</p>
            <h3 className="mt-1 text-[16px] font-bold text-slate-900">{t(lang,"trHead")}</h3>
            <div className="mt-4 space-y-2">{trace.nodes.map((node, index) => <div key={node.id}><div className={`rounded-sm border p-3 ${node.breached ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}><div className="flex justify-between gap-2"><b className="text-[13px] text-slate-900">{node.office}</b><span className={`text-[11px] font-bold ${node.breached ? "text-red-700" : "text-slate-500"}`}>{node.breached ? t(lang,"brChip") : t(lang,"targetChip")}</span></div><p className="mt-1 text-[11px] text-slate-600">{node.designation} · {t(lang,"heldWord")} {node.daysHeld}d / {t(lang,"deadlineWord")} {node.statutoryDeadlineDays}d</p><p className="mt-1 text-[11px] text-slate-500">{node.rule}</p></div>{index < trace.nodes.length - 1 && <div className="ml-5 h-3 border-l-2 border-slate-200" />}</div>)}</div>
            <div className="mt-4 rounded-sm border border-amber-200 bg-[#fff8e6] p-3"><p className="text-[11px] font-bold uppercase tracking-wide text-[#8a6d00]">{t(lang,"slaClock")}{caseData.kind === "payment-tat-breach" ? " · RBI DPSS.CO.PD No.629/02.01.014/2019-20" : ""}</p><p className="text-2xl font-bold text-slate-900">₹{trace.tatCompensationAccrued.toLocaleString("en-IN")}</p><p className="text-[11px] text-slate-600">{trace.daysOverdue} × ₹100/day · {caseData.kind === "payment-tat-breach" ? t(lang,"slaIrctcNote") : t(lang,"slaEpfoNote")}</p></div>
            <details className="mt-3"><summary className="cursor-pointer text-[12px] font-semibold text-[#1a4b8e]">{t(lang,"viewEscalation")} (CPA 2019 §2(11))</summary><pre className="mt-2 whitespace-pre-wrap rounded-sm border border-slate-200 bg-[#f8fafc] p-3 text-[11px] leading-relaxed text-slate-700">{trace.escalationLetter}</pre><button type="button" onClick={() => { const blob = new Blob([trace.escalationLetter], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `escalation-${caseData.id}.txt`; a.click(); URL.revokeObjectURL(url); }} className={btnOutline + " mt-2 text-[11px]"}>{t(lang,"downloadLetter")}</button></details>
          </div>}

          <div className={cardCls + " border-l-4 border-l-[#1a4b8e] p-5"}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">{t(lang,"provEyebrow")}</p>
            <h3 className="mt-1 text-[15px] font-bold text-slate-900">{provenance ? (provenance.tier === "OFFICIAL" ? t(lang,"provHOfficial") : provenance.tier === "SANDBOX" ? t(lang,"provHSandbox") : t(lang,"provHUnknown")) : t(lang,"provChecking")}</h3>
            <div className="mt-2 space-y-1 text-[12px] text-slate-700">{provenance && <><p>{lang === "hi" ? "मूल:" : "Origin:"} <b className="break-all">{provenance.origin}</b></p><p>TLS: <b className={provenance.secure ? "text-green-700" : "text-red-700"}>{provenance.secure ? t(lang,"tlsOk") : t(lang,"tlsBad")}</b></p><p className="text-[11px] text-slate-500">{t(lang,"provMethod")}</p><p className="text-[11px] text-slate-500">{provenance.note}</p></>}</div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{t(lang,"provPhish")}</p>
          </div>

          <div className={cardCls + " p-5"}>
            <h3 className="text-[13px] font-bold text-[#1a4b8e]">{t(lang,"realHead")} {t(lang,"honestySuffix")}</h3>
            <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-slate-700">
              {(DICT[lang].honestItems ?? DICT.en.honestItems).map((item, idx, arr) => <li key={idx}><span aria-hidden className="mr-1">{idx < arr.length - 1 ? "✓" : "◌"}</span>{item}</li>)}
            </ul>
            <div className="mt-4 rounded-sm border border-slate-200 bg-[#f8fafc] p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#1a4b8e]">{t(lang,"diffHead")}</p>
              <p className="mt-1.5 text-[12px] font-semibold text-slate-900">{t(lang,"diffLead")}</p>
              <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-slate-600">
                {(DICT[lang].diffItems ?? DICT.en.diffItems).map((item) => <li key={item}>{boldParts(item)}</li>)}
              </ul>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">{t(lang,"regsFoot")}</p>
          </div>
        </aside>
      </div>}
    </GovShell>
  );
}
