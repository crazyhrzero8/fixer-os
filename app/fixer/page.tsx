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

  // New features state
  const [alerts, setAlerts] = useState<{ type: "warn" | "info" | "alert"; message: string; messageHi: string }[]>([]);
  const [rtiDraft, setRtiDraft] = useState("");
  const [accountabilityStats, setAccountabilityStats] = useState<{
    totalCases: number;
    totalAccruedCompensation: number;
    totalOverdueDays: number;
    worstOffice: string;
    avgDelayEpfo: number;
    avgDelayPayments: number;
  } | null>(null);
  const [activeNoticeTab, setActiveNoticeTab] = useState<"appeal" | "rti">("appeal");

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
      setCaseData(casePayload.case); 
      setVerified(casePayload.verification?.valid === true);
      setAlerts(casePayload.alerts || []);
      setRtiDraft(casePayload.rtiDraft || "");
    }
    setProof(await proofResponse.json()); setTrace(await traceResponse.json());
    const preflightPayload = await preflightResponse.json().catch(() => null);
    setPreflight(preflightPayload?.results ?? []);
  }

  async function loadAccountability() {
    try {
      const res = await fetch("/api/accountability");
      if (res.ok) {
        setAccountabilityStats(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    void (async () => {
      const r = await fetch("/api/cases");
      const p = await r.json();
      setCases(p.cases);
    })();
    void loadAccountability();
  }, []);

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
      if (response.ok) {
        setLastAction(payload.result);
        await load(selected);
        await loadAccountability();
      }
      else setLastAction({ action: "ERROR", summary: t(lang,"errRejected"), detail: payload.error ?? t(lang,"errNet"), mode: "deterministic" });
    } catch (e) { setLastAction({ action: "ERROR", summary: t(lang,"errNet"), detail: String(e), mode: "deterministic" }); }
    setBusy(false);
  }

  async function restart() {
    setBusy(true);
    await fetch(`/api/case/${selected}`, { method: "POST" });
    setLastAction(null);
    await load(selected);
    await loadAccountability();
    setBusy(false);
  }

  if (!canAccess) {
    return (
      <GovShell active="/fixer">
        <div className="mx-auto max-w-md mt-16 text-center">
          <div className={`${cardCls} p-6 sm:p-8 space-y-6 shadow-md border-t-4 border-t-red-600 rounded-none`}>
            <span className="text-xs font-sans uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2.5 py-1">[ACCESS DENIED]</span>
            <h2 className="text-xl font-bold text-slate-800">
              {lang === "hi" ? "पहुंच अस्वीकृत" : "Access Denied"}
            </h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {lang === "hi" 
                ? "सुरक्षा कारणों से, ऑडिट कार्यक्षेत्र को सीधे नहीं खोला जा सकता है। कृपया मुख्य नियंत्रण कंसोल बटन के माध्यम से प्रवेश करें।"
                : "For security compliance, the Audit Workspace cannot be accessed directly. Please enter by clicking the FIXER.OS Control Console button on the Home Page."}
            </p>
            <div className="pt-2">
              <Link href="/" className={`${btnPrimary} w-full py-2.5 font-bold block text-center rounded-none`}>
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
        <div className="mb-4 text-center text-[12px] font-bold text-green-700 bg-green-50 border border-green-300 rounded-none p-3 shadow-sm">
          {t(lang, "bannerConsole")}
        </div>
        
        <div className="mx-auto max-w-sm mt-12">
          <form onSubmit={handleLogin} className={`${cardCls} p-6 sm:p-8 space-y-4 rounded-none`}>
            <div className="text-center">
              <span className="text-xs font-sans uppercase tracking-wider text-[#1a4b8e] bg-[#eef3f9] border border-[#1a4b8e]/30 px-2 py-1">[SECURE AUTH]</span>
              <h2 className="mt-2 text-xl font-bold text-slate-800 font-sans">
                {lang === "hi" ? "सुरक्षा पिन आवश्यक" : "Security Access PIN"}
              </h2>
              <p className="mt-1 text-[12px] text-slate-500">
                {lang === "hi" ? "ऑडिट कार्यक्षेत्र खोलने के लिए पिन दर्ज करें" : "Enter the 4-digit PIN to open the workspace"}
              </p>
            </div>

            {loginError && (
              <p className="rounded-none border-l-4 border-red-600 bg-red-50 p-2.5 text-[12px] font-semibold text-red-700">
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
                className="w-full text-center text-2xl tracking-widest font-sans rounded-none border border-slate-300 px-3 py-2.5 focus:border-[#1a4b8e] focus:outline-none"
                placeholder="••••"
                autoFocus
                required
              />
            </div>

            <input id="admin-username" type="hidden" value="admin" />

            <button id="admin-login-btn" type="submit" className={`${btnPrimary} w-full py-2.5 font-bold rounded-none`}>
              {lang === "hi" ? "कार्यक्षेत्र खोलें →" : "Verify & Open Workspace →"}
            </button>

            <p className="text-center text-[11px] text-slate-500 bg-[#f8fafc] border border-slate-200 rounded-none p-2 font-semibold">
              {lang === "hi" ? "डेमो पिन: 1902" : "Demo Access PIN: 1902"}
            </p>
          </form>
        </div>
      </GovShell>
    );
  }

  return (
    <GovShell active="/fixer">
      <div className="mb-4 text-center text-[12px] font-bold text-[#2f6e4f] bg-[#eef7f2] border border-[#2f6e4f]/30 rounded-none p-3">
        {t(lang, "bannerConsole")}
      </div>

      {/* Main Dossier Workspace Wrapper (Ink/Light-Blue Styling) */}
      <div className="mx-auto max-w-5xl bg-[#f0f4fa] text-[#1c1a17] border border-[#d0daf0] rounded-none p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in select-none">
        
        {/* Aggregate Systemic Accountability Dashboard (Ruled Folio Rows) */}
        {accountabilityStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-[#d0daf0]">
            <div className="pl-4 border-l-2 border-[#1a4b8e]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{lang === "hi" ? "कुल ऑडिट मामले" : "Total Audited Cases"}</p>
              <p className="text-xl font-bold text-[#1c1a17] mt-1">{accountabilityStats.totalCases}</p>
            </div>
            <div className="pl-4 border-l-2 border-[#2f6e4f]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{lang === "hi" ? "कुल संचित हर्जाना" : "Total SLA Compensation"}</p>
              <p className="text-xl font-bold text-[#2f6e4f] mt-1">₹{accountabilityStats.totalAccruedCompensation.toLocaleString("en-IN")}</p>
            </div>
            <div className="pl-4 border-l-2 border-[#a13d2f]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{lang === "hi" ? "सर्वाधिक उल्लंघन विभाग" : "Worst Blocker Office"}</p>
              <p className="text-[12px] font-bold text-[#a13d2f] mt-2 truncate" title={accountabilityStats.worstOffice}>{accountabilityStats.worstOffice}</p>
            </div>
            <div className="pl-4 border-l-2 border-slate-400">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{lang === "hi" ? "औसत विलंब (EPFO / भुगतान)" : "Avg Delay (EPFO / Pay)"}</p>
              <p className="text-[13px] font-bold text-[#1c1a17] mt-2">
                {accountabilityStats.avgDelayEpfo}d / {accountabilityStats.avgDelayPayments}d
              </p>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          
          {/* Left Column: Citizen List (Ruled Ledger List) */}
          <div className="space-y-4 pr-2 md:border-r md:border-[#d0daf0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-[#d0daf0]">
              {lang === "hi" ? "नागरिक और शिकायतें" : "Citizens & Complaints"}
            </h3>
            <div className="divide-y divide-[#d0daf0]">
              {cases.map((c, index) => {
                const isActive = selected === c.id;
                const citizenName = c.id.includes("ramu") ? "Ramu Prasad" : c.id.includes("radhika") ? "Radhika Sharma" : "Arjun Kumar";
                const isResolved = c.status === "RESOLVED";
                const folioNum = `Folio ${String(index + 1).padStart(3, "0")}`;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelected(c.id);
                      setLastAction(null);
                    }}
                    className={`w-full text-left py-3 focus:outline-none focus:ring-1 focus:ring-[#1a4b8e] text-xs block transition-colors rounded-none ${
                      isActive
                        ? "bg-[#e6effc] border-l-2 border-[#1a4b8e] pl-2 font-bold"
                        : "hover:bg-[#e6effc]/40 pl-2 text-slate-600"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-bold text-[#1c1a17] text-[13px]">{citizenName}</span>
                      <span className={`text-[9px] font-sans font-bold px-1.5 py-0.5 border ${
                        isResolved ? "border-[#2f6e4f]/30 text-[#2f6e4f] bg-[#2f6e4f]/5" : "border-[#a13d2f]/30 text-[#a13d2f] bg-[#a13d2f]/5"
                      }`}>
                        {isResolved ? (lang === "hi" ? "समाधान" : "RESOLVED") : (lang === "hi" ? "समीक्षा" : "UNDER AUDIT")}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] font-sans text-slate-400">
                      {folioNum} · {translateTitle(lang, c.title)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Case Details Dashboard */}
          <div className="space-y-6 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d0daf0] pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">
                  {lang === "hi" ? "नागरिक दावा डैशबोर्ड" : "Citizen Claims Dashboard"}
                </p>
                <h2 className="text-xl font-bold text-slate-800 mt-1">
                  {caseData ? translateTitle(lang, caseData.title) : t(lang, "fixTitle")}
                </h2>
              </div>
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
              <p className="text-center text-[13px] text-slate-500 py-10 font-sans">{t(lang, "loadingLedger")}</p>
            ) : (
              <div className="space-y-6">
                {/* Proactive Scheduler Alerts (Static Stamped Red Warning blocks) */}
                {alerts.length > 0 && (
                  <div className="space-y-2">
                    {alerts.map((alert, index) => (
                      <div key={index} className={`p-3 border-l-2 text-[12px] flex items-start gap-2 bg-[#e6effc]/40 ${
                        alert.type === "alert" 
                          ? "border-[#a13d2f] text-[#a13d2f] font-bold" 
                          : alert.type === "warn" 
                            ? "border-amber-500 text-amber-900" 
                            : "border-blue-500 text-blue-900"
                      }`}>
                        <span className="text-[10px] font-sans border px-1 bg-white font-bold">{alert.type === "alert" ? "ALERT" : alert.type === "warn" ? "WARN" : "INFO"}</span>
                        <span className="leading-normal">{lang === "hi" ? alert.messageHi : alert.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status and Summary Header Card */}
                <div className={`border-l-2 py-2 pl-4 space-y-1 bg-[#e6effc]/20 ${caseData.status === "RESOLVED" ? "border-[#2f6e4f]" : "border-[#a13d2f]"}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {lang === "hi" ? "अपील की स्थिति" : "APPEAL STATUS"}
                    </span>
                    <span className={`text-[9px] font-sans font-bold px-2 py-0.5 border ${
                      caseData.status === "RESOLVED"
                        ? "border-[#2f6e4f]/30 text-[#2f6e4f] bg-[#2f6e4f]/5"
                        : "border-[#a13d2f]/30 text-[#a13d2f] bg-[#a13d2f]/5"
                    }`}>
                      {caseData.status === "RESOLVED"
                        ? (lang === "hi" ? "समाधान मिला" : "RESOLVED")
                        : (lang === "hi" ? "अस्वीकृत / समीक्षाधीन" : "REJECTED / UNDER AUDIT")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#1c1a17]">
                    {caseData.kind === "epfo-false-rejection"
                      ? (lang === "hi" ? "झूठी अस्वीकृति: नाम बेमेल होने का गलत दावा" : "False Rejection: System incorrectly flagged name mismatch")
                      : (lang === "hi" ? "भुगतान विफलता: तत्काल टिकट जारी नहीं हुआ" : "Payment Delay: Tatkal ticket failed, amount debited")}
                  </h3>
                  <p className="text-[12px] text-slate-500 font-serif italic">
                    {caseData.kind === "epfo-false-rejection" ? t(lang, "nameProofLine") : t(lang, "tatProofLine")}
                  </p>
                </div>

                {/* SLA Compensation Accrued (Static Seal-Green banner) */}
                {trace && (
                  <div className="border border-[#2f6e4f]/30 bg-[#2f6e4f]/5 p-5 text-center space-y-1 rounded-none">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#2f6e4f]">
                      {lang === "hi" ? "अर्जित विलंब मुआवज़ा (आपके अधिकार)" : "ACCRUED DELAY COMPENSATION (YOUR RIGHTS)"}
                    </p>
                    <p className="text-4xl font-extrabold text-[#2f6e4f]">
                      ₹{trace.tatCompensationAccrued.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {trace.daysOverdue} {lang === "hi" ? "दिन का विलंब" : "days delay"} × ₹100/{lang === "hi" ? "दिन जुर्माना (RBI TAT circular & e-SLA नियम)" : "day fine (RBI TAT & e-SLA rules)"}
                    </p>
                  </div>
                )}

                {/* Proof of Delay (Office Tracker Ledger) */}
                {trace && (
                  <details className="group overflow-hidden">
                    <summary className="cursor-pointer select-none py-3 text-[11px] font-bold text-slate-500 hover:text-[#1c1a17] border-b border-[#d0daf0] flex items-center justify-between">
                      <span><span className="font-sans text-[10px] bg-[#eef3f9] text-[#1a4b8e] px-1 border border-[#1a4b8e]/20 mr-1.5">[AUDIT]</span>{lang === "hi" ? "विलंब का प्रमाण (कार्यालय ट्रैकर)" : "View Proof of Delay (Office Tracker)"}</span>
                      <span className="transition-transform group-open:rotate-180">▼</span>
                    </summary>
                    <div className="py-4 space-y-4 bg-[#f0f4fa] rounded-none">
                      {trace.nodes.map((node, index) => (
                        <div key={node.id} className="relative">
                          <div className={`py-3 pl-4 border-l-2 ${node.breached ? "border-[#a13d2f]" : "border-[#2f6e4f]"} text-[12px]`}>
                            <div className="flex justify-between items-center gap-2">
                              <span className="font-bold text-[#1c1a17]">{translateTraceNode(lang, node.office)}</span>
                              <span className={`text-[9px] font-sans font-bold px-1.5 py-0.5 border ${
                                node.breached ? "border-[#a13d2f]/30 text-[#a13d2f] bg-[#a13d2f]/5" : "border-[#2f6e4f]/30 text-[#2f6e4f] bg-[#2f6e4f]/5"
                              }`}>
                                {node.breached ? (lang === "hi" ? "[BREACH] समय-सीमा उल्लंघन" : "[BREACH] Deadline Breached") : (lang === "hi" ? "समय-सीमा के भीतर" : "Within Deadline")}
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
                            <div className="ml-4 h-3 border-l border-dashed border-[#d0daf0]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Secure Notebook Status */}
                <div className="flex items-center justify-between border-y border-[#d0daf0] py-4 text-[12px]">
                  <div className="flex items-center gap-2 text-[#2f6e4f] font-semibold">
                    <span className="text-[10px] font-sans border border-[#2f6e4f]/30 px-1 bg-[#2f6e4f]/5 mr-1">[SECURED]</span>
                    <span>{lang === "hi" ? "छेड़छाड़-रहित ऑडिट नोटबुक" : "Tamper-Proof Audit Ledger Secured"}</span>
                  </div>
                  <div className="font-medium">
                    {verified ? (
                      <span className="text-[#2f6e4f]">[PASS] {lang === "hi" ? "प्रमाणित" : "Hash Chain Verified"} ({caseData.events.length} {lang === "hi" ? "घटनाएँ" : "events"})</span>
                    ) : (
                      <span className="text-[#a13d2f] font-bold">[FAIL] {lang === "hi" ? "सत्यापन विफल" : "Chain Corrupted"}</span>
                    )}
                  </div>
                </div>

                {/* Hash Chain Timeline / Ledger Feed */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {lang === "hi" ? "लेज़र घटना सूची (हैश चेन)" : "Ledger Event History (SHA-256 Chain)"}
                  </h4>
                  <div className="relative pl-6">
                    {/* Stitch vertical thread line down the left margin */}
                    <div className={`absolute left-[7px] top-2 bottom-2 border-l ${
                      verified ? "border-[#2f6e4f] border-solid" : "border-[#a13d2f] border-dashed"
                    }`} />

                    <div className="space-y-6 font-sans text-[11px]">
                      {caseData.events.map((e, index) => {
                        const isBreach = e.type.includes("REJECTED") || e.type.includes("BREACH");
                        const entryNum = `Entry ${String(index + 1).padStart(3, "0")}`;
                        return (
                          <div key={e.id} className="relative group">
                            {/* Event node dot on the vertical line */}
                            <div className={`absolute left-[-22px] top-1.5 h-2 w-2 rounded-full border ${
                              isBreach 
                                ? "bg-[#a13d2f] border-[#a13d2f]" 
                                : verified 
                                  ? "bg-[#2f6e4f] border-[#2f6e4f]" 
                                  : "bg-[#a13d2f] border-[#a13d2f]"
                            }`} />

                            <div className="space-y-1.5 pb-4 border-b border-[#d0daf0]/60">
                              <div className="flex flex-wrap justify-between items-center gap-2">
                                <span className="font-bold text-[#1c1a17]">{entryNum} · {eventLabel(e.type)}</span>
                                <span className="text-[10px] text-slate-400">{new Date(e.ts).toLocaleString("en-IN")}</span>
                              </div>
                              <div className="text-slate-500">
                                {lang === "hi" ? "कर्ता:" : "Actor:"} <span className="font-bold text-slate-700">{e.actor.toUpperCase()}</span>
                              </div>
                              <div className="bg-[#e6effc]/40 p-2 border-l border-[#d0daf0] text-slate-600 space-y-1 overflow-x-auto rounded-none">
                                {Object.entries(e.payload).map(([k, v]) => (
                                  <div key={k} className="whitespace-nowrap">
                                    <span className="text-slate-400">{k}:</span> {String(v)}
                                  </div>
                                ))}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate" title={e.hash}>
                                {lang === "hi" ? "ब्लॉक हैश:" : "Block Hash:"} <span className="text-slate-600 font-bold">{e.hash}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Evidence Vault */}
                <div className="space-y-4 pt-4 border-t border-[#d0daf0]">
                  <div className="flex justify-between items-center border-b border-[#d0daf0] pb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">[VAULT] {lang === "hi" ? "साक्ष्य तिजोरी (हैश-एंकर संलग्नक)" : "Evidence Vault (Hash-Anchored Attachments)"}</span>
                  </div>
                  
                  {caseData.events.filter(e => e.type === "DOCUMENT_ATTACHED").length === 0 ? (
                    <p className="text-slate-400 text-[11px] italic text-center py-2">{lang === "hi" ? "कोई दस्तावेज़ संलग्न नहीं है। कानूनी अपील के लिए प्रमाण जोड़ें।" : "No evidence documents attached. Attach proof to make appeals legally valid."}</p>
                  ) : (
                    <div className="divide-y divide-[#d0daf0]/60 font-sans text-[11px]">
                      {caseData.events.filter(e => e.type === "DOCUMENT_ATTACHED").map((e: any, index) => (
                        <div key={index} className="py-2.5 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#1c1a17]">{e.payload.fileName}</span>
                            <span className="text-[9px] border border-slate-300 px-1 rounded-none text-slate-500">{e.payload.fileType}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            Hash: <span className="text-[#1c1a17] select-all font-bold">{e.payload.fileHash}</span>
                          </div>
                          <div className="text-[9.5px] text-slate-400">
                            Anchored on: {new Date(e.ts).toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#d0daf0] flex flex-wrap gap-3 items-center justify-between">
                    <select
                      id="evidence-select"
                      className="text-[11px] rounded-none border border-[#d0daf0] bg-[#f0f4fa] px-2 py-1.5 focus:border-[#1a4b8e] focus:outline-none"
                    >
                      <option value="rejection_notice.png">rejection_notice.png</option>
                      <option value="bank_statement.pdf">bank_statement.pdf</option>
                      <option value="claim_receipt.pdf">claim_receipt.pdf</option>
                    </select>
                    <button
                      type="button"
                      onClick={async () => {
                        const selectEl = document.getElementById("evidence-select") as HTMLSelectElement;
                        const fileName = selectEl.value;
                        const hash = Array.from({length: 64}, (_, i) => ((fileName.charCodeAt(i % fileName.length) * 17) % 16).toString(16)).join("");
                        const fileType = fileName.endsWith(".png") ? "image/png" : "application/pdf";
                        
                        setBusy(true);
                        try {
                          const r = await fetch(`/api/case/${selected}`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "ATTACH", fileName, fileHash: hash, fileType })
                          });
                          if (r.ok) {
                            await load(selected);
                            await loadAccountability();
                          }
                        } catch (e) {
                          console.error(e);
                        }
                        setBusy(false);
                      }}
                      disabled={busy}
                      className={`${btnOutline} py-1.5 px-3 text-[11px] font-bold rounded-none`}
                    >
                      [ATTACH] {lang === "hi" ? "दस्तावेज़ जोड़ें" : "Attach Proof"}
                    </button>
                  </div>
                </div>

                {/* Actions Area */}
                <div className="space-y-3 pt-4 border-t border-[#d0daf0]">
                  {caseData.status !== "RESOLVED" ? (
                    <div className="space-y-3">
                      <button
                        id="run-step-btn"
                        onClick={runStep}
                        disabled={busy}
                        className={`${btnPrimary} w-full py-3 text-[14px] font-bold text-center flex justify-center items-center gap-2 rounded-none`}
                      >
                        {busy ? (
                          <>
                            <span className="animate-spin mr-1">/</span>
                            {t(lang, "analyzing")}
                          </>
                        ) : (
                          <>
                            <span className="font-sans mr-1">[AUDIT]</span>
                            {lang === "hi" ? "दस्तावेज़ों का ऑडिट करें और दावा बढ़ाएँ" : "Audit Submission & Verify Claims"}
                          </>
                        )}
                      </button>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={async () => {
                            setBusy(true);
                            const res = await fetch("/api/warrant", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ caseId: caseData.id, lang }) });
                            const data = await res.json();
                            setLastAction({ action:"WARRANT", summary: lang==="hi" ? "वारंट उत्पन्न" : "Warrant generated", detail: data.warrantText?.slice(0,200) || "" });
                            setBusy(false);
                          }}
                          disabled={busy}
                          className={`${btnOutline} py-2 text-[11px] font-bold rounded-none`}
                        >
                          {lang==="hi" ? "[वारंट] पूर्वदायित्व" : "[WARRANT] Prospective"}
                        </button>
                        <button
                          onClick={async () => {
                            setBusy(true);
                            const res = await fetch("/api/classbundle", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ caseId: caseData.id }) });
                            const data = await res.json();
                            setLastAction({ action:"BUNDLE", summary: lang==="hi" ? "क्लास बंडल" : "Class bundle", detail: data.found ? `Bundle ${data.manifest.bundleId}` : "No match" });
                            setBusy(false);
                          }}
                          disabled={busy}
                          className={`${btnOutline} py-2 text-[11px] font-bold rounded-none`}
                        >
                          {lang==="hi" ? "[बंडल] वर्ग कार्रवाई" : "[BUNDLE] Class Action"}
                        </button>
                        <button
                          onClick={async () => {
                            setBusy(true);
                            const res = await fetch("/api/explanation", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ caseId: caseData.id, lang }) });
                            const data = await res.json();
                            setLastAction({ action:"EXPLANATION", summary: lang==="hi" ? "DPDP स्पष्टीकरण" : "DPDP Explanation", detail: data.hasAiDecision ? "Demand ready" : "No AI decision" });
                            setBusy(false);
                          }}
                          disabled={busy}
                          className={`${btnOutline} py-2 text-[11px] font-bold rounded-none`}
                        >
                          {lang==="hi" ? "[DPDP] स्पष्टीकरण" : "[DPDP] Explain"}
                        </button>
                      </div>
                      {lastAction && (
                        <div className="border-l-2 border-[#2f6e4f] bg-[#e6effc]/20 p-3 text-[12px] text-slate-700 font-serif">
                          <b>{lang === "hi" ? "एजेंट विश्लेषण:" : "Agent Log:"}</b> {lastAction.summary}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Tab Selectors */}
                      <div className="flex border-b border-[#d0daf0] text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setActiveNoticeTab("appeal")}
                          className={`pb-2 px-4 border-b-2 transition-all ${
                            activeNoticeTab === "appeal" ? "border-[#1a4b8e] text-[#1a4b8e]" : "border-transparent text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          [Notice] {lang === "hi" ? "अपील पत्र" : "Appeal Notice"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveNoticeTab("rti")}
                          className={`pb-2 px-4 border-b-2 transition-all ${
                            activeNoticeTab === "rti" ? "border-[#1a4b8e] text-[#1a4b8e]" : "border-transparent text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          [RTI] {lang === "hi" ? "आरटीआई आवेदन" : "RTI Draft (Act 2005)"}
                        </button>
                      </div>

                      {activeNoticeTab === "appeal" ? (
                        <div className="space-y-4">
                          {trace?.escalationLetter && (
                            <div className="space-y-2">
                              <label className="block text-[11px] font-bold uppercase text-slate-500">
                                {lang === "hi" ? "अपील पत्र पूर्वावलोकन" : "Appeal Notice Preview"}
                              </label>
                              <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words w-full max-w-full rounded-none border border-[#d0daf0] bg-[#e6effc]/10 p-3 font-mono text-[11px] leading-relaxed text-[#1c1a17]">
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
                              className={`${btnPrimary} w-full py-3 text-[14px] font-bold flex justify-center items-center gap-2 rounded-none`}
                            >
                              {lang === "hi" ? "कानूनी अपील पैकेज डाउनलोड करें (.txt)" : "Download Legal Appeal Notice (.txt)"}
                            </button>
                            <button
                              type="button"
                              onClick={restart}
                              disabled={busy}
                              className={`${btnOutline} py-3 text-[14px] rounded-none`}
                            >
                              {t(lang, "consoleRestart")}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {rtiDraft && (
                            <div className="space-y-2">
                              <label className="block text-[11px] font-bold uppercase text-slate-500">
                                {lang === "hi" ? "आरटीआई आवेदन पत्र (धारा 6(1) के तहत)" : "RTI Request Draft (under Section 6(1))"}
                              </label>
                              <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words w-full max-w-full rounded-none border border-[#d0daf0] bg-[#e6effc]/10 p-3 font-mono text-[11px] leading-relaxed text-[#1c1a17]">
                                {rtiDraft}
                              </pre>
                            </div>
                          )}
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                const blob = new Blob([rtiDraft], { type: "text/plain" });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `rti-application-${caseData.id}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className={`${btnPrimary} w-full py-3 text-[14px] font-bold flex justify-center items-center gap-2 rounded-none`}
                            >
                              {lang === "hi" ? "आरटीआई आवेदन डाउनलोड करें (.txt)" : "Download RTI Application (.txt)"}
                            </button>
                            <button
                              type="button"
                              onClick={restart}
                              disabled={busy}
                              className={`${btnOutline} py-3 text-[14px] rounded-none`}
                            >
                              {t(lang, "consoleRestart")}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Heatmap Analytics Section */}
        <div className="pt-6 border-t border-[#d0daf0] space-y-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">
              {lang === "hi" ? "राष्ट्रीय विलंब विश्लेषण" : "National Delay Analytics"}
            </p>
            <h2 className="text-xl font-bold text-[#1c1a17] mt-1">
              {lang === "hi" ? "EPFO राज्य-वार विलंब हीटमैप" : "EPFO State-Wise Delay Heatmap"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {lang === "hi" 
                ? "SLA विलंब के आधार पर विभिन्न राज्यों के प्रदर्शन की तुलना करें। विवरण देखने के लिए किसी राज्य पर क्लिक करें।" 
                : "Compare performance of different states based on SLA delay. Click a state to view local performance metrics."}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-[1fr_300px] items-start pt-2">
            {/* Interactive SVG India Map */}
            <div className="flex flex-col justify-between min-h-[420px]">
              <div className="relative w-full flex justify-center items-center">
                <svg viewBox="0 0 612 696" className="w-full max-w-[420px] h-auto">
                  {/* Geographically Accurate India State Paths */}
                  {(() => {
                    const { INDIA_MAP_PATHS } = require("@/data/indiaMap");
                    return INDIA_MAP_PATHS.map((state: { id: string; name: string; d: string }) => {
                      const heatmapId = state.id === "TG" ? "TS" : state.id;
                      const st = HEATMAP_DATA.find((h) => h.id === heatmapId);
                      const isSelected = selectedHeatmapState?.id === heatmapId;

                      // Color coding based on delay metrics
                      let fillCls = "fill-[#e6effc] hover:fill-[#d9e5f7] transition-colors";
                      if (st) {
                        if (st.avgDelay > 35) {
                          fillCls = isSelected 
                            ? "fill-[#a13d2f] cursor-pointer drop-shadow-sm" 
                            : "fill-[#a13d2f]/80 hover:fill-[#a13d2f] cursor-pointer transition-colors";
                        } else if (st.avgDelay > 20) {
                          fillCls = isSelected 
                            ? "fill-[#c28c38] cursor-pointer drop-shadow-sm" 
                            : "fill-[#c28c38]/80 hover:fill-[#c28c38] cursor-pointer transition-colors";
                        } else {
                          fillCls = isSelected 
                            ? "fill-[#2f6e4f] cursor-pointer drop-shadow-sm" 
                            : "fill-[#2f6e4f]/80 hover:fill-[#2f6e4f] cursor-pointer transition-colors";
                        }
                      }

                      return (
                        <path
                          key={state.id}
                          d={state.d}
                          className={`${fillCls} outline-none`}
                          stroke={isSelected ? "#1a4b8e" : "#d4cdbd"}
                          strokeWidth={isSelected ? 2 : 1.2}
                          onClick={() => {
                            if (st) setSelectedHeatmapState(st);
                          }}
                        >
                          <title>{lang === "hi" && st ? st.nameHi : state.name}</title>
                        </path>
                      );
                    });
                  })()}
                </svg>
              </div>

              {/* Severity Legend */}
              <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 border-t border-[#d0daf0] pt-4 mt-4">
                <span><span className="inline-block w-2.5 h-2.5 bg-[#2f6e4f] mr-1 align-middle"></span> {lang === "hi" ? "कम विलंब (<20 दिन)" : "Low Delay (<20d)"}</span>
                <span><span className="inline-block w-2.5 h-2.5 bg-[#c28c38] mr-1 align-middle"></span> {lang === "hi" ? "मध्यम विलंब (20-35 दिन)" : "Medium Delay (20-35d)"}</span>
                <span><span className="inline-block w-2.5 h-2.5 bg-[#a13d2f] mr-1 align-middle"></span> {lang === "hi" ? "अत्यधिक विलंब (>35 दिन)" : "Severe Delay (>35d)"}</span>
              </div>
            </div>

            {/* Selected State Details Panel */}
            <div className="flex flex-col justify-between py-2 pl-6 md:border-l md:border-[#d0daf0] min-h-[300px]">
              {selectedHeatmapState ? (
                <div className="space-y-5">
                  <div className="border-b border-[#d0daf0] pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedHeatmapState.id}</span>
                    <h4 className="text-base font-bold text-[#1c1a17]">
                      {lang === "hi" ? selectedHeatmapState.nameHi : selectedHeatmapState.name}
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === "hi" ? "औसत प्रसंस्करण विलंब" : "Average Processing Delay"}
                      </span>
                      <span className="text-xl font-extrabold text-[#1c1a17] flex items-baseline gap-1 mt-0.5">
                        {selectedHeatmapState.avgDelay} <span className="text-xs font-semibold text-slate-500">{lang === "hi" ? "दिन" : "days"}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {lang === "hi" ? "समीक्षाधीन सक्रिय मामले" : "Active Overdue Cases"}
                      </span>
                      <span className="text-xl font-extrabold text-[#1c1a17] flex items-baseline gap-1 mt-0.5">
                        {selectedHeatmapState.overdueCases.toLocaleString("en-IN")} <span className="text-xs font-semibold text-slate-500">{lang === "hi" ? "शिकायतें" : "grievances"}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#a13d2f] uppercase tracking-wider block">
                        {lang === "hi" ? "कुल संचित हर्जाना" : "Total SLA Compensation"}
                      </span>
                      <span className="text-xl font-extrabold text-[#a13d2f] flex items-baseline gap-1 mt-0.5">
                        ₹ {selectedHeatmapState.totalComp.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] leading-relaxed text-slate-500 bg-[#e6effc]/40 border border-[#d0daf0] p-2.5 rounded">
                    [INFO] {lang === "hi" 
                      ? "हर्जाना दर ₹100 प्रति दिन प्रति अतिदेय शिकायत के आधार पर निर्धारित है।"
                      : "Compensation calculated at ₹100 per day per overdue case under e-SLA acts."}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-full text-center py-16 space-y-2">
                  <span className="text-xs font-sans border border-slate-300 px-2 py-1 bg-slate-100">[MAP]</span>
                  <p className="text-xs font-medium text-slate-400">
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
