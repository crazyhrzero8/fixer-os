import { GovShell, cardCls } from "../govshell";

export default function Terms() {
  return (
    <GovShell active="/terms">
      <div className={`${cardCls} p-6 sm:p-8`}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">Terms & Conditions — Synthetic Demo · Latest as of 22 Aug 2026</p>
        <h2 className="mt-2 text-2xl font-bold text-[#1a4b8e]">You are using a safe simulation, not the real government site.</h2>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-700">All data is synthetic (A. Kumar XXXX-XXXX-1234, UAN 100000000000). No real Aadhaar, PAN, OTP, or money is used. No live EPFO/IRCTC system is touched — judges test only the consumer journey, as per <a href="https://buildwhatmovesindia.com/brief" className="underline text-[#1a4b8e]">Builder Brief § What we want you to build</a>.</p>

        <div className="mt-6 space-y-5 text-[13px] leading-relaxed text-slate-700">
          <section className="rounded-sm border border-slate-200 bg-[#f8fafc] p-4">
            <h3 className="font-bold text-[#1a4b8e]">1. RBI — Your money, your deadline (Monetary Rule)</h3>
            <p className="mt-1">RBI circular <b>DPSS.CO.PD No.629/02.01.014/2019-20 dated 20 Sep 2019</b> (effective 15 Oct 2019, unchanged through Aug 2026 per SBI Payments V2 10 Dec 2025) — <i>Harmonisation of TAT and Compensation for Failed Transactions</i>. If your account is debited but merchant (IRCTC) gets no confirmation, bank must auto-reverse within <b>T+5 calendar days</b> (T = calendar date, not working days) and pay <b>₹100/day beyond T+5</b> <b>suo moto</b> (para 5: without waiting for your complaint). If not paid, escalate to <b>RBI Integrated Ombudsman Scheme 2021</b> (para 6). This is the exact rule our SLA clock uses (RRN demo). Source: <a href="https://www.rbi.org.in/commonman/English/Scripts/Notification.aspx?Id=3074" className="underline text-[#1a4b8e]">rbi.org.in</a>, ET 2025 TAT explainer.</p>
          </section>
          <section className="rounded-sm border border-slate-200 bg-[#f8fafc] p-4">
            <h3 className="font-bold text-[#1a4b8e]">2. EPFO — 10-year pension rule (Monetary + Service Rule)</h3>
            <p className="mt-1">EPS 1995 para 12 + <b>EPS 2026 Gazette Jul 2026</b> (Code on Social Security 2020): <b>≥10 years pensionable service → monthly pension at 58</b> (reduced at 50, -4%/yr; defer to 60 +4%/yr). &lt;10 years → <b>Form 10C lump sum or Scheme Certificate</b> to carry forward (Mint 24 May 2026). &lt;6 months → no withdrawal. Service rounds: <b>6 months+ = 1 year</b>. Our RuleGuard proves the portal bug in <b>[9.5,10) unrounded</b> where withdrawal says &lt;9.5 and pension says ≥10 — no outcome. Fix: both engines on <code>roundedService</code>. Pensionable salary cap <b>₹15,000</b>, formula <code>(Salary × Service)/70</code>, EPF interest <b>8.25%</b> (2025-26).</p>
          </section>
          <section className="rounded-sm border border-slate-200 bg-[#f8fafc] p-4">
            <h3 className="font-bold text-[#1a4b8e]">3. CPA 2019 — Deficiency of Service (Legal Teeth)</h3>
            <p className="mt-1">Consumer Protection Act 2019 <b>§2(11)</b> deficiency = any imperfection in service required by law/contract. EPFO has been held a service provider — most recently <b>Kangra Commission CC/297/2025 Abhinay Katoch vs EPFO 20 Jul 2026</b> (LiveLaw) awarded shortfall + 9% interest + ₹1,000 harassment + ₹2,500 costs for rounding down service. Jurisdiction per <b>CP Jurisdiction Rules 2021</b>: District ≤₹50L, State ₹50L–₹2Cr, National &gt;₹2Cr (eDaakhil.nic.in). Our escalation letter cites this.</p>
          </section>
          <section className="rounded-sm border border-slate-200 bg-[#f8fafc] p-4">
            <h3 className="font-bold text-[#1a4b8e]">4. DPDP Act 2023 — Your data, your rights (Privacy Rule)</h3>
            <p className="mt-1">Digital Personal Data Protection Act <b>11 Aug 2023</b> + <b>Rules 13 Nov 2025</b> phased: <b>Phase I 13 Nov 2025</b> Data Protection Board, <b>Phase II 13 Nov 2026</b> Consent Managers, <b>Phase III 13 May 2027</b> full compliance (PIB 17 Nov 2025, TaxGuru 18 Aug 2026). Until then, <b>IT Act 2000 + SPDI Rules 2011</b> govern. Our demo is <b>synthetic-only, purpose-limited, breach-notified via hash chain</b> — DPDP-ready, not yet DPDP-liable.</p>
          </section>
          <section className="rounded-sm border border-slate-200 bg-[#f8fafc] p-4">
            <h3 className="font-bold text-[#1a4b8e]">5. GIGW 3.0 — How govt sites must look (Accessibility & Versatility)</h3>
            <p className="mt-1">Guidelines for Indian Government Websites <b>3.0 Dec 2023</b> (MeitY/NIC/STQC/CERT-In): <b>115 checkpoints, WCAG 2.1 AA 4.5:1 contrast, keyboard/nav, bilingual, mobile, Safe-to-Host audit</b> for CQW certification. Only <b>31/957 (3.3%)</b> passed 2016 STQC audit (Factly) — last published aggregate; GIGW 3.0 re-audit required from Dec 2023. FIXER.OS follows: light `#f5f7fa` bg, `#1a4b8e` 8.6:1, `font-sans` system, `A⁻/A/A⁺` scaling 85-130%, `prefers-reduced-motion`, `lang` hi/en.</p>
          </section>
          <section className="rounded-sm border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-900">6. Your Consent — What you agree to by checking the box</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>You understand this is a <b>simulation</b> — no real money moves, no real grievance filed.</li>
              <li>You consent to store your <b>synthetic</b> interaction in a per-process hash chain for demo (deleted on redeploy).</li>
              <li>You won’t enter real Aadhaar/PAN/OTP. If you do, it’s rejected by `zod` and never stored.</li>
              <li>Rate limit `30/min`, OTP `5-min 3-attempt`, captcha `crypto.randomBytes` — all server-owned.</li>
              <li>For real EPFO: use <a href="https://unifiedportal-mem.epfindia.gov.in" className="underline text-[#1a4b8e]">unifiedportal-mem.epfindia.gov.in</a> with your actual credentials and 2FA.</li>
            </ul>
            <p className="mt-3 text-[11px] text-slate-500">Last updated 22 Aug 2026. Sources: RBI commonman PDF DPSS.CO.PD No.629, SBI Payments V2 10 Dec 2025 p1, ET Wealth 12 Oct 2019, ET UPI 27 Mar 2025, Mint 24 May + 3 Jul 2026, Kustodian Jul 2026, Cleartax 13 Jul 2026, CodeforBanks 28 Jan 2026, LiveLaw 20 Jul 2026, PIB 17 Nov 2025, TaxGuru 18 Aug 2026, guidelines.india.gov.in 24 Jul 2026, STQC handbook 16 Dec 2023, Factly Apr 2018. No live govt system probed.</p>
          </section>
        </div>
      </div>
    </GovShell>
  );
}
