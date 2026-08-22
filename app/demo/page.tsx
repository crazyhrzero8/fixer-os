"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GovShell, btnOutline, cardCls } from "../govshell";
import { useLang, t } from "@/lib/i18n";

const CONTENT = {
  en: {
    alone: ["Captcha accepted", "PF advance submitted", "Under Process · day 7", "Rejected: name mismatch (false)", "Invalid tracking ID", "Next grievance allowed in 30 days", "STUCK — no accountable owner"],
    fixed: ["Import verified evidence", "Prove names match (ledger vs portal claim)", "Draft rebuttal from hash-chained facts", "Record grievance closure gap (invalid ID)", "Calculate ₹2,600 SLA accrual", "Trace Regional Office blocker (26d overdue)", "Escalation packet routed — RESOLVED"],
    aloneSub: "Portal owns the status, the evidence, and the clock — citizen tracks alone.",
    fixedSub: "Independent evidence turns a false rejection into an accountable, named route.",
    aloneFinal: "STUCK — grievance theater, no owner",
    fixedFinal: "RESOLVED — packet ready for RPFC/CPC",
    noveltyHead: "The novelty is the direction of verification",
    noveltyBody: "Most assistants check whether a citizen fits a rule. FIXER.OS checks whether the state's decision fits independently verified facts — then preserves the contradiction in a hash chain and names the overdue owner.",
    judgeHead: "What judges test in 2 minutes — and where to click",
    j1a: "Minute 1 (citizen): Press ", j1b: "Run comparison", j1c: " — watch left stall at “Next grievance in 30 days” while right chains 5 agent actions to RESOLVED.",
    j2a: "Minute 2 (builder): Open ", j2b: "Agent Console", j2c: " → pick synthetic-irctc-001 for the RBI TAT payment case (RRN + T+5 + ₹100/day) → run steps → download escalation letter.",
    j3a: "Trial credentials: UAN ", j3b: " / ", j3c: " on Simulated Portal. No real data, no live govt system.",
    ready: "Ready", working: "Working…"
  },
  hi: {
    alone: ["कैप्चा स्वीकृत", "पीएफ अग्रिम जमा", "प्रक्रिया में · दिन 7", "अस्वीकृत: नाम मेल नहीं खाता (झूठा)", "अमान्य ट्रैकिंग आईडी", "अगली शिकायत 30 दिन में", "अटक गया — कोई ज़िम्मेदार नहीं"],
    fixed: ["सत्यापित साक्ष्य आयात", "नाम मेल सिद्ध करें (बहीखाता vs पोर्टल दावा)", "हैश-शृंखला तथ्यों से प्रत्युत्तर तैयार", "शिकायत-बंद होने का अंतर दर्ज (अमान्य आईडी)", "₹2,600 SLA हिसाब", "क्षेत्रीय कार्यालय अवरोधक (26 दिन अतिरिक्त)", "एस्केलेशन पैकेट भेजा — हल हुआ"],
    aloneSub: "पोर्टल के पास स्थिति, साक्ष्य और घड़ी है — नागरिक अकेला चक्कर काटता है।",
    fixedSub: "स्वतंत्र साक्ष्य झूठी अस्वीकृति को ज़िम्मेदार, नाम-साथ प्रतिउत्तर बनाता है।",
    aloneFinal: "अटक गया — शिकायत-खेल, कोई मालिक नहीं",
    fixedFinal: "हल — RPFC/CPC के लिए पैकेट तैयार",
    noveltyHead: "नवीनता जाँच की दिशा है",
    noveltyBody: "ज़्यादातर सहायक जाँचते हैं कि नागरिक नियम में फिट है या नहीं। FIXER.OS जाँचता है कि राज्य का निर्णय स्वतंत्र सत्यापित तथ्यों में फिट है या नहीं — फिर विरोधाभास को हैश शृंखला में सुरक्षित रखता है और अतिरिक्त-स्थगित स्वामी का नाम लेता है।",
    judgeHead: "जज 2 मिनट में क्या जाँचते हैं — और कहाँ क्लिक करें",
    j1a: "मिनट 1 (नागरिक): ", j1b: "तुलना चलाएँ", j1c: " दबाएँ — बाईं ओर “अगली शिकायत 30 दिन में” पर अटकते देखें, दाईं ओर 5 एजेंट-कदम हल तक।",
    j2a: "मिनट 2 (निर्माता): ", j2b: "एजेंट कंसोल", j2c: " खोलें → RBI TAT भुगतान केस के लिए synthetic-irctc-001 चुनें (RRN + T+5 + ₹100/दिन) → कदम चलाएँ → पत्र डाउनलोड करें।",
    j3a: "परीक्षण लॉगिन: UAN ", j3b: " / ", j3c: " नकली पोर्टल पर। असली डेटा नहीं, लाइव सरकारी सिस्टम नहीं।",
    ready: "तैयार", working: "चल रहा है…"
  }
};

export default function Demo() {
  const { lang } = useLang();
  const c = CONTENT[lang as "en" | "hi"];
  const [running, setRunning] = useState(false); const [left, setLeft] = useState(0); const [right, setRight] = useState(0); const [seconds, setSeconds] = useState(0); const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  function stop() { if (timer.current) clearInterval(timer.current); timer.current = null; setRunning(false); }
  function restart() { stop(); setLeft(0); setRight(0); setSeconds(0); setRunning(true); }
  useEffect(() => { if (!running) return; timer.current = setInterval(() => { setSeconds((value) => value + 1); setLeft((value) => Math.min(value + 1, c.alone.length)); setRight((value) => Math.min(value + 1, c.fixed.length)); }, 900); return stop; }, [running]);
  useEffect(() => { if (right >= c.fixed.length) stop(); }, [right]);
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
        <button onClick={restart} className="rounded-sm bg-[#1a4b8e] px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-[#123763]">{running ? t(lang,"demoRestartPlayback") : t(lang,"demoRun")}</button>
        <button onClick={stop} disabled={!running} className={btnOutline + " disabled:opacity-40"}>{t(lang,"demoPause")}</button>
        <span className="font-mono text-[12px] text-slate-600">{String(seconds).padStart(2, "0")}s elapsed</span>
        <span className="text-[11px] text-slate-500">Left: portal owns status. Right: citizen owns evidence.</span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title={t(lang,"citizenAlone")} subtitle={c.aloneSub} tone="red" steps={c.alone} active={left} final={c.aloneFinal} readyLabel={c.ready} workingLabel={c.working} />
        <Panel title={t(lang,"citizenFixed")} subtitle={c.fixedSub} tone="blue" steps={c.fixed} active={right} final={c.fixedFinal} readyLabel={c.ready} workingLabel={c.working} />
      </div>

      <div className={`${cardCls} mt-5 border-l-4 border-l-[#1a4b8e] p-4`}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">{c.noveltyHead}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-700">{c.noveltyBody}</p>
        <p className="mt-2 text-[11px] text-slate-500">Citations: RBI TAT DPSS.CO.PD No.629/2019-20 (₹100/day suo moto) · EPS 1995 §10 / EPS 2026 (10-yr rule, Gazette Jul 2026) · CPA 2019 §2(11) deficiency (Kangra Commission, 20 Jul 2026) · DPDP Act 2023 / Rules 13 Nov 2025 phased · GIGW 3.0 Dec 2023 · Prior art honestly cited: EPFO CITES 2.01 pre-validation (Jul 2026), Delhi e-SLA auto-compensation (2011), Catala/CUTECat rule-checking (France) — none hand the proof to the citizen.</p>
      </div>

      <div className={`${cardCls} mt-5 p-4`}>
        <h3 className="text-[13px] font-bold text-[#1a4b8e]">{c.judgeHead}</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[12px] leading-relaxed text-slate-700">
          <li><b>Minute 1 (citizen):</b> Press <i>Run comparison</i> — watch left stall at &ldquo;Next grievance in 30 days&rdquo; (documented EPFO lockout) while right chains 5 agent actions to RESOLVED.</li>
          <li><b>Minute 2 (builder):</b> Open <Link href="/fixer" className="underline text-[#1a4b8e]">Agent Console</Link> → pick <i>synthetic-irctc-001</i> for RBI TAT payment case (RRN + T+5 + ₹100/day) → run steps → download escalation letter.</li>
          <li>Trial credentials: UAN <b>100000000000</b> / <b>demo1234</b> on <Link href="/portal" className="underline text-[#1a4b8e]">Simulated Portal</Link>. No real data, no live govt system.</li>
        </ol>
      </div>
    </GovShell>
  );
}
function Panel({ title, subtitle, tone, steps, active, final, readyLabel, workingLabel }: { title: string; subtitle: string; tone: "red" | "blue"; steps: string[]; active: number; final: string; readyLabel: string; workingLabel: string }) {
  const completed = active >= steps.length;
  const frame = tone === "red" ? "border-red-200 bg-red-50/40" : "border-[#1a4b8e]/20 bg-[#eef3f9]";
  const dotActive = tone === "red" ? "bg-red-700 text-white" : "bg-[#1a4b8e] text-white";
  const heading = tone === "red" ? "text-red-800" : "text-[#1a4b8e]";
  return (
    <section className={`${cardCls} p-5 ${frame}`}>
      <p className={`text-[11px] font-bold uppercase tracking-widest ${heading}`}>{title}</p>
      <h3 className={`mt-1 text-[16px] font-bold ${completed ? heading : "text-slate-900"}`}>{completed ? final : active ? workingLabel : readyLabel}</h3>
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
