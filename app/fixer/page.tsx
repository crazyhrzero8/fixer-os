"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GovShell, btnOutline, btnPrimary, cardCls } from "../govshell";
import { useLang, t, DICT, translateEvent, translateTitle, translateTraceNode, translateTraceNodeRule, translatePreflight } from "@/lib/i18n";

type CaseKind = "epfo-false-rejection" | "payment-tat-breach";
type CaseData = { id: string; kind: CaseKind; title: string; status: string; facts: Record<string, unknown>; events: { id: string; actor: string; type: string; ts: number; hash: string; payload: Record<string, unknown> }[] };
type Proof = { contradiction: boolean; domain: string; proofSteps: string[]; suggestedRouteAround: string; bugReport: string };
type Trace = { nodes: { id: string; office: string; designation: string; statutoryDeadlineDays: number; daysHeld: number; rule: string; breached: boolean }[]; blocker: { office: string; designation: string }; daysOverdue: number; tatCompensationAccrued: number; escalationLetter: string };
type CaseOption = { id: string; title: string; status: string };
type Preflight = { ruleId: string; status: "PASS" | "FAIL" | "WARN"; message: string; fix: string };
type Prov = { origin: string; secure: boolean; tier: "OFFICIAL" | "SANDBOX" | "UNKNOWN"; service: string | null; note: string };

const eventLabel = (value: string) => value.replaceAll("_", " ");
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

const HEATMAP_DATA = [
  { id: "DL", name: "Delhi", nameHi: "दिल्ली", avgDelay: 45, overdueCases: 850, totalComp: 3825000, color: "bg-red-500 hover:bg-red-600 text-white" },
  { id: "MH", name: "Maharashtra", nameHi: "महाराष्ट्र", avgDelay: 38, overdueCases: 1240, totalComp: 4712000, color: "bg-orange-500 hover:bg-orange-600 text-white" },
  { id: "KA", name: "Karnataka", nameHi: "कर्नाटक", avgDelay: 42, overdueCases: 980, totalComp: 4116000, color: "bg-red-500 hover:bg-red-600 text-white" },
  { id: "TN", name: "Tamil Nadu", nameHi: "तमिलनाडु", avgDelay: 29, overdueCases: 740, totalComp: 2146000, color: "bg-amber-500 hover:bg-amber-600 text-slate-800" },
  { id: "UP", name: "Uttar Pradesh", nameHi: "उत्तर प्रदेश", avgDelay: 51, overdueCases: 1520, totalComp: 7752000, color: "bg-red-700 hover:bg-red-800 text-white" },
  { id: "GJ", name: "Gujarat", nameHi: "गुजरात", avgDelay: 22, overdueCases: 510, totalComp: 1122000, color: "bg-yellow-400 hover:bg-yellow-500 text-slate-800" },
  { id: "WB", name: "West Bengal", nameHi: "पश्चिम बंगाल", avgDelay: 35, overdueCases: 630, totalComp: 2205000, color: "bg-orange-400 hover:bg-orange-500 text-slate-800" },
  { id: "TS", name: "Telangana", nameHi: "तेलंगाना", avgDelay: 40, overdueCases: 890, totalComp: 3560000, color: "bg-red-500 hover:bg-red-600 text-white" },
  { id: "KL", name: "Kerala", nameHi: "केरल", avgDelay: 18, overdueCases: 320, totalComp: 576000, color: "bg-yellow-300 hover:bg-yellow-400 text-slate-800" },
  { id: "AP", name: "Andhra Pradesh", nameHi: "आंध्र प्रदेश", avgDelay: 31, overdueCases: 580, totalComp: 1798000, color: "bg-orange-400 hover:bg-orange-500 text-slate-800" },
  { id: "HR", name: "Haryana", nameHi: "हरियाणा", avgDelay: 47, overdueCases: 790, totalComp: 3713000, color: "bg-red-600 hover:bg-red-700 text-white" }
];

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
  const [selectedHeatmapState, setSelectedHeatmapState] = useState<typeof HEATMAP_DATA[number] | null>(null);

  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [canAccess, setCanAccess] = useState(true);

  useEffect(() => {
    const allowed = sessionStorage.getItem("allowed_to_login") === "true";
    const authenticatedState = sessionStorage.getItem("admin_authenticated") === "true";
    if (authenticatedState) {
      setAuthenticated(true);
    }
    if (!allowed && !authenticatedState) {
      setCanAccess(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1902") {
      sessionStorage.setItem("admin_authenticated", "true");
      setAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError(lang === "hi" ? "अमान्य सुरक्षा पिन" : "Error: Invalid 4-digit PIN.");
      setPin("");
    }
  };

  async function load(caseId: string) {
    const [caseResponse, proofResponse, traceResponse, preflightResponse] = await Promise.all([
      fetch(`/api/case/${caseId}`),
      fetch(`/api/prove/pension?lang=${lang}`),
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
  useEffect(() => { void load(selected); }, [selected, lang]);
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

  if (!canAccess) {
    return (
      <GovShell active="/fixer">
        <div className="mx-auto max-w-md mt-16 text-center">
          <div className={`${cardCls} p-6 sm:p-8 space-y-6 shadow-md border-t-4 border-t-red-600`}>
            <span className="text-4xl">🚫</span>
            <h2 className="text-xl font-bold text-slate-800">
              {lang === "hi" ? "पहुंच अस्वीकृत" : "Access Denied"}
            </h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {lang === "hi" 
                ? "सुरक्षा कारणों से, ऑडिट कार्यक्षेत्र को सीधे नहीं खोला जा सकता है। कृपया मुख्य नियंत्रण कंसोल बटन के माध्यम से प्रवेश करें।"
                : "For security compliance, the Audit Workspace cannot be accessed directly. Please enter by clicking the FIXER.OS Control Console button on the Home Page."}
            </p>
            <div className="pt-2">
              <Link href="/" className={`${btnPrimary} w-full py-2.5 font-bold block text-center`}>
                {lang === "hi" ? "मुख्य पृष्ठ पर जाएं" : "Go to Home Page"}
              </Link>
            </div>
          </div>
        </div>
      </GovShell>
    );
  }

  if (!authenticated) {
    return (
      <GovShell active="/fixer">
        <div className="mb-4 text-center text-[12px] font-bold text-green-700 bg-green-50 border border-green-300 rounded-md p-3 shadow-sm">
          {t(lang, "bannerConsole")}
        </div>
        
        <div className="mx-auto max-w-sm mt-12">
          <form onSubmit={handleLogin} className={`${cardCls} p-6 sm:p-8 space-y-4`}>
            <div className="text-center">
              <span className="text-3xl">🛡️</span>
              <h2 className="mt-2 text-xl font-bold text-slate-800 font-sans">
                {lang === "hi" ? "सुरक्षा पिन आवश्यक" : "Security Access PIN"}
              </h2>
              <p className="mt-1 text-[12px] text-slate-500">
                {lang === "hi" ? "ऑडिट कार्यक्षेत्र खोलने के लिए पिन दर्ज करें" : "Enter the 4-digit PIN to open the workspace"}
              </p>
            </div>

            {loginError && (
              <p className="rounded border-l-4 border-red-600 bg-red-50 p-2.5 text-[12px] font-semibold text-red-700">
                {loginError}
              </p>
            )}

            <div className="space-y-1">
              <input
                id="admin-password"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center text-2xl tracking-widest font-mono rounded border border-slate-300 px-3 py-2.5 focus:border-[#1a4b8e] focus:outline-none"
                placeholder="••••"
                autoFocus
                required
              />
            </div>

            <input id="admin-username" type="hidden" value="admin" />

            <button id="admin-login-btn" type="submit" className={`${btnPrimary} w-full py-2.5 font-bold`}>
              {lang === "hi" ? "कार्यक्षेत्र खोलें →" : "Verify & Open Workspace →"}
            </button>

            <p className="text-center text-[11px] text-slate-500 bg-[#f8fafc] border border-slate-200 rounded p-2 font-semibold">
              {lang === "hi" ? "डेमो पिन: 1902" : "Demo Access PIN: 1902"}
            </p>
          </form>
        </div>
      </GovShell>
    );
  }

  return (
    <GovShell active="/fixer">
      <div className="mb-4 text-center text-[12px] font-bold text-green-700 bg-green-50 border border-green-300 rounded-md p-3 shadow-sm animate-fade-in">
        {t(lang, "bannerConsole")}
      </div>

      {/* 2-Column Responsive Workspace Grid */}
      <div className="mx-auto max-w-5xl mt-6 grid gap-6 md:grid-cols-[280px_1fr]">
        
        {/* Left Column: Citizen List */}
        <div className={`${cardCls} p-4 space-y-4 h-fit bg-slate-50/50`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
            {lang === "hi" ? "नागरिक और शिकायतें" : "Citizens & Complaints"}
          </h3>
          <div className="space-y-2">
            {cases.map((c) => {
              const isActive = selected === c.id;
              const citizenName = c.id.includes("ramu") ? "Ramu Prasad" : c.id.includes("radhika") ? "Radhika Sharma" : "Arjun Kumar";
              const isResolved = c.status === "RESOLVED";
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelected(c.id);
                    setLastAction(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all text-xs block ${
                    isActive
                      ? "border-[#1a4b8e] bg-[#eef3f9] shadow-sm ring-1 ring-[#1a4b8e]/50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-slate-800 text-[13px]">{citizenName}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${isResolved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                      {isResolved ? (lang === "hi" ? "समाधान" : "RESOLVED") : (lang === "hi" ? "समीक्षा" : "UNDER AUDIT")}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 font-medium line-clamp-1">
                    {translateTitle(lang, c.title)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Details Dashboard */}
        <div className={`${cardCls} p-6 sm:p-8 space-y-6 shadow-md h-fit`}>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">
                {lang === "hi" ? "नागरिक दावा डैशबोर्ड" : "Citizen Claims Dashboard"}
              </p>
              <h2 className="text-xl font-bold text-slate-800 mt-1">
                {caseData ? translateTitle(lang, caseData.title) : t(lang, "fixTitle")}
              </h2>
            </div>
            {/* Hidden select dropdown to maintain automated testing / NavBot selector compatibility */}
            <select
              id="case-select"
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                setLastAction(null);
              }}
              className="hidden"
            >
              {(cases.length ? cases : [{ id: selected, title: selected, status: "" }]).map((c) => (
                <option key={c.id} value={c.id}>
                  {translateTitle(lang, c.title)}
                </option>
              ))}
            </select>
          </div>

          {!caseData ? (
            <p className="text-center text-[13px] text-slate-500 py-10">{t(lang, "loadingLedger")}</p>
          ) : (
            <div className="space-y-6">
              {/* Status and Summary */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-bold text-slate-500 uppercase">
                    {lang === "hi" ? "अपील की स्थिति" : "APPEAL STATUS"}
                  </span>
                  <span
                    className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                      caseData.status === "RESOLVED"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                  >
                    {caseData.status === "RESOLVED"
                      ? (lang === "hi" ? "समाधान मिला" : "RESOLVED")
                      : (lang === "hi" ? "अस्वीकृत / समीक्षाधीन" : "REJECTED / UNDER AUDIT")}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {caseData.kind === "epfo-false-rejection"
                    ? (lang === "hi" ? "झूठी अस्वीकृति: नाम बेमेल होने का गलत दावा" : "False Rejection: System incorrectly flagged name mismatch")
                    : (lang === "hi" ? "भुगतान विफलता: तत्काल टिकट जारी नहीं हुआ" : "Payment Delay: Tatkal ticket failed, amount debited")}
                </h3>
                <p className="text-[13px] text-slate-600">
                  {caseData.kind === "epfo-false-rejection" ? t(lang, "nameProofLine") : t(lang, "tatProofLine")}
                </p>
              </div>

              {/* SLA Compensation Accrued (HERO) */}
              {trace && (
                <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50/50 p-5 text-center space-y-1 shadow-sm animate-pulse">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    {lang === "hi" ? "अर्जित विलंब मुआवज़ा (आपके अधिकार)" : "ACCRUED DELAY COMPENSATION (YOUR RIGHTS)"}
                  </p>
                  <p className="text-4xl font-extrabold text-emerald-900">
                    ₹{trace.tatCompensationAccrued.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[12px] text-slate-600">
                    {trace.daysOverdue} {lang === "hi" ? "दिन का विलंब" : "days delay"} × ₹100/{lang === "hi" ? "दिन जुर्माना (RBI TAT circular & e-SLA नियम)" : "day fine (RBI TAT & e-SLA rules)"}
                  </p>
                </div>
              )}

              {/* Proof of Delay (Collapsible) */}
              {trace && (
                <details className="group border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <summary className="cursor-pointer select-none px-4 py-3 text-[12px] font-bold text-slate-700 hover:bg-slate-100 flex items-center justify-between">
                    <span>🔍 {lang === "hi" ? "विलंब का प्रमाण (कार्यालय ट्रैकर)" : "View Proof of Delay (Office Tracker)"}</span>
                    <span className="transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <div className="px-4 pb-4 pt-2 space-y-3 border-t border-slate-200 bg-white">
                    {trace.nodes.map((node, index) => (
                      <div key={node.id} className="relative">
                        <div className={`rounded-md border p-3 text-[12px] ${node.breached ? "border-red-200 bg-red-50/30" : "border-slate-200 bg-white"}`}>
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-bold text-slate-800">{translateTraceNode(lang, node.office)}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${node.breached ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-500"}`}>
                              {node.breached ? (lang === "hi" ? "❌ समय-सीमा उल्लंघन" : "❌ Deadline Breached") : (lang === "hi" ? "समय-सीमा के भीतर" : "Within Deadline")}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-600">
                            {translateTraceNode(lang, node.designation)} · {lang === "hi" ? "फाइल रखी:" : "Held:"} <b>{node.daysHeld}d</b> / {lang === "hi" ? "अधिकतम समय-सीमा:" : "Limit:"} <b>{node.statutoryDeadlineDays}d</b>
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500 italic">
                            {translateTraceNodeRule(lang, node.rule)}
                          </p>
                        </div>
                        {index < trace.nodes.length - 1 && (
                          <div className="ml-6 h-3 border-l-2 border-dashed border-slate-300" />
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Secure Notebook Status */}
              <div className="flex items-center justify-between border-y border-slate-200 py-3 text-[12px]">
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <span>🔒</span>
                  <span>{lang === "hi" ? "छेड़छाड़-रहित ऑडिट नोटबुक" : "Tamper-Proof Audit Ledger Secured"}</span>
                </div>
                <div className="text-slate-500 font-medium">
                  {verified ? (
                    <span className="text-emerald-700">✓ {lang === "hi" ? "प्रमाणित" : "Hash Chain Verified"} ({caseData.events.length} {lang === "hi" ? "घटनाएँ" : "events"})</span>
                  ) : (
                    <span className="text-rose-700">✗ {lang === "hi" ? "सत्यापन विफल" : "Chain Corrupted"}</span>
                  )}
                </div>
              </div>

              {/* Hidden progress tracking for NavBot E2E Walkthrough alignment */}
              <div className="hidden" aria-label="Agent progress">
                {(DICT[lang].chips ?? DICT.en.chips).map((label, idx) => {
                  const done = caseData.status === "RESOLVED" || caseData.events.filter((e) => e.actor === "agent").length > idx;
                  return <span key={label}>{done ? "✓" : ""}</span>;
                })}
              </div>

              {/* Actions Area */}
              <div className="space-y-3">
                {caseData.status !== "RESOLVED" ? (
                  <div className="space-y-3">
                    <button
                      id="run-step-btn"
                      onClick={runStep}
                      disabled={busy}
                      className={`${btnPrimary} w-full py-3 text-[14px] font-bold text-center flex justify-center items-center gap-2`}
                    >
                      {busy ? (
                        <>
                          <span className="animate-spin">🔄</span>
                          {t(lang, "analyzing")}
                        </>
                      ) : (
                        <>
                          <span>🛡️</span>
                          {lang === "hi" ? "दस्तावेज़ों का ऑडिट करें और दावा बढ़ाएँ" : "Audit Submission & Verify Claims"}
                        </>
                      )}
                    </button>
                    {lastAction && (
                      <div className="rounded border-l-4 border-emerald-600 bg-emerald-50 p-3 text-[12px] text-slate-700">
                        <b>{lang === "hi" ? "एजेंट विश्लेषण:" : "Agent Log:"}</b> {lastAction.summary}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trace?.escalationLetter && (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase text-slate-500">
                          {lang === "hi" ? "अपील पत्र पूर्वावलोकन" : "Appeal Notice Preview"}
                        </label>
                        <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-relaxed text-slate-700">
                          {trace.escalationLetter}
                        </pre>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        id="download-letter-btn"
                        onClick={() => {
                          const blob = new Blob([trace?.escalationLetter || ""], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `escalation-${caseData.id}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className={`${btnPrimary} w-full py-3 text-[14px] font-bold flex justify-center items-center gap-2`}
                      >
                        <span>📥</span>
                        {lang === "hi" ? "कानूनी अपील पैकेज डाउनलोड करें (.txt)" : "Download Legal Appeal Notice (.txt)"}
                      </button>
                      <button
                        type="button"
                        onClick={restart}
                        disabled={busy}
                        className={`${btnOutline} py-3 text-[14px]`}
                      >
                        {t(lang, "consoleRestart")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Analytics Section */}
      <div className="mx-auto max-w-5xl mt-8">
        <div className={`${cardCls} p-6 sm:p-8 space-y-6 shadow-md`}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">
              {lang === "hi" ? "राष्ट्रीय विलंब विश्लेषण" : "National Delay Analytics"}
            </p>
            <h2 className="text-xl font-bold text-slate-800 mt-1">
              {lang === "hi" ? "EPFO राज्य-वार विलंब हीटमैप" : "EPFO State-Wise Delay Heatmap"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {lang === "hi" 
                ? "SLA विलंब के आधार पर विभिन्न राज्यों के प्रदर्शन की तुलना करें। विवरण देखने के लिए किसी राज्य पर क्लिक करें।" 
                : "Compare performance of different states based on SLA delay. Click a state to view local performance metrics."}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            {/* Interactive State Map Grid */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between min-h-[350px]">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {HEATMAP_DATA.map((st) => {
                  const isSelected = selectedHeatmapState?.id === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setSelectedHeatmapState(st)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        isSelected 
                          ? "border-[#1a4b8e] ring-2 ring-[#1a4b8e]/50 font-bold scale-105" 
                          : "border-slate-200 hover:border-slate-300"
                      } ${st.color} flex flex-col justify-center items-center gap-1 shadow-sm`}
                    >
                      <span className="text-[13px] font-bold tracking-wider">{st.id}</span>
                      <span className="text-[10px] truncate max-w-full font-medium">{lang === "hi" ? st.nameHi : st.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Severity Legend */}
              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 border-t border-slate-200 pt-4 mt-6">
                <span>🟢 {lang === "hi" ? "कम विलंब (<20 दिन)" : "Low Delay (<20d)"}</span>
                <span>🟡 {lang === "hi" ? "मध्यम विलंब (20-35 दिन)" : "Medium Delay (20-35d)"}</span>
                <span>🔴 {lang === "hi" ? "अत्यधिक विलंब (>35 दिन)" : "Severe Delay (>35d)"}</span>
              </div>
            </div>

            {/* Selected State Details Panel */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white flex flex-col justify-between">
              {selectedHeatmapState ? (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedHeatmapState.id}</span>
                    <h4 className="text-base font-bold text-slate-800">
                      {lang === "hi" ? selectedHeatmapState.nameHi : selectedHeatmapState.name}
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === "hi" ? "औसत प्रसंस्करण विलंब" : "Average Processing Delay"}
                      </span>
                      <span className="text-xl font-extrabold text-slate-800 flex items-baseline gap-1 mt-0.5">
                        {selectedHeatmapState.avgDelay} <span className="text-xs font-semibold text-slate-500">{lang === "hi" ? "दिन" : "days"}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === "hi" ? "समीक्षाधीन सक्रिय मामले" : "Active Overdue Cases"}
                      </span>
                      <span className="text-xl font-extrabold text-slate-800 flex items-baseline gap-1 mt-0.5">
                        {selectedHeatmapState.overdueCases.toLocaleString("en-IN")} <span className="text-xs font-semibold text-slate-500">{lang === "hi" ? "शिकायतें" : "grievances"}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === "hi" ? "कुल संचित हर्जाना" : "Total SLA Compensation"}
                      </span>
                      <span className="text-xl font-extrabold text-red-600 flex items-baseline gap-1 mt-0.5">
                        ₹ {selectedHeatmapState.totalComp.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] leading-relaxed text-slate-500 bg-slate-50 border border-slate-200 p-2.5 rounded">
                    💡 {lang === "hi" 
                      ? "हर्जाना दर ₹100 प्रति दिन प्रति अतिदेय शिकायत के आधार पर निर्धारित है।"
                      : "Compensation calculated at ₹100 per day per overdue case under e-SLA acts."}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-full text-center py-10 space-y-2">
                  <span className="text-3xl">🗺️</span>
                  <p className="text-xs font-medium text-slate-500">
                    {lang === "hi" 
                      ? "विवरण और गणना देखने के लिए मानचित्र पर एक राज्य का चयन करें।" 
                      : "Select a state on the map to view performance and SLA metrics."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GovShell>
  );
}
