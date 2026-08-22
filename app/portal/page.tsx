"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { initialPortalSnapshot, portalCitizen, PORTAL_STATES, PROCESSING_DAYS, type PortalAction, type PortalSnapshot } from "@/lib/portalFsm";
import { SYNTHETIC_CITIZEN } from "@/data/seed";
import { GovShell, btnOutline, btnPrimary, cardCls } from "../govshell";
import { useLang, t } from "@/lib/i18n";

const MARQUEE_ITEMS = [
  "Attention Members: OTP-based authentication is mandatory for availing online services.",
  "Kindly keep your UAN, password and captcha characters ready before beginning.",
  "This demonstration portal replays documented real-world failure sequences."
];

const inputCls = "mt-1 w-full rounded-sm border border-slate-300 bg-white px-2 py-1.5 text-[13px] text-slate-900 outline-none focus:border-[#1a4b8e] focus:ring-1 focus:ring-[#1a4b8e]";
const sectionHead = "border-b border-slate-300 bg-[#eef3f9] px-4 py-2 text-[15px] font-bold text-[#1a4b8e]";
const th = "border border-slate-300 bg-[#eef3f9] px-3 py-1.5 text-left text-[12px] font-bold uppercase tracking-wide";

export default function Portal() {
  const { lang } = useLang();
  const [snapshot, setSnapshot] = useState<PortalSnapshot>(initialPortalSnapshot);
  const [captchaText, setCaptchaText] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [uan, setUan] = useState<string>(SYNTHETIC_CITIZEN.evaluationUan);
  const [password, setPassword] = useState<string>(SYNTHETIC_CITIZEN.evaluationPassword);
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadCaptcha() {
    try {
      const r = await fetch("/api/portal/action");
      const p = await r.json();
      if (p.spaced) setCaptchaText(p.spaced as string);
      if (p.captcha) setCaptchaText(p.captcha.split("").join(" "));
    } catch { setError("Captcha service unavailable. Kindly refresh the page."); }
  }

  useEffect(() => { void loadCaptcha(); }, []);

  async function dispatch(action: PortalAction, extra?: Record<string, string>) {
    setBusy(true); setError("");
    try {
      const body: Record<string, string> = { action, ...(extra ?? {}) };
      // For VERIFY_CAPTCHA, send uan/password/captcha for server validation (ponytail: server owns truth, not client)
      if (action === "VERIFY_CAPTCHA") {
        body.uan = uan.trim();
        body.password = password;
        body.captcha = captcha;
      }
      if (action === "VERIFY_OTP") body.otp = otp.trim();
      const response = await fetch("/api/portal/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = (await response.json()) as { snapshot?: PortalSnapshot; error?: string; demoOtp?: string; captcha?: string; spaced?: string };
      if (!response.ok || !result.snapshot) {
        // Handle REFRESH_CAPTCHA which returns captcha directly
        if (result.captcha || result.spaced) {
          if (result.spaced) setCaptchaText(result.spaced as string);
          else if (result.captcha) setCaptchaText((result.captcha as string).split("").join(" "));
          setCaptcha("");
          if (result.error) setError(result.error);
          return;
        }
        throw new Error(result.error ?? "Portal unavailable.");
      }
      setSnapshot(result.snapshot);
      if (result.error) setError(result.error);
      else setError("");
      if (result.demoOtp) setDemoOtp(result.demoOtp as string);
      // Refresh captcha text after any state that stays in LOGIN_FRICTION
      if (action === "VERIFY_CAPTCHA" || action === "REFRESH_CAPTCHA" || action === "VERIFY_OTP") {
        // Always fetch fresh spaced captcha for next attempt — native random per click
        const refreshed = await fetch("/api/portal/action");
        const p = await refreshed.json();
        if (p.spaced) setCaptchaText(p.spaced as string);
        if (action === "VERIFY_CAPTCHA") setCaptcha("");
        if (action === "VERIFY_OTP" && result.error) setOtp("");
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Portal unavailable."); }
    finally { setBusy(false); }
  }

  async function refreshCaptcha() {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/portal/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "REFRESH_CAPTCHA" }) });
      const p = await r.json();
      if (p.spaced) setCaptchaText(p.spaced as string);
      else if (p.captcha) setCaptchaText((p.captcha as string).split("").join(" "));
      setCaptcha("");
    } catch { setError("Could not refresh captcha."); }
    finally { setBusy(false); }
  }

  return (
    <GovShell active="/portal">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300 bg-[#fff8e6] px-4 py-2 text-[12px] text-[#8a6d00]">
        <span><b>Evaluation login</b> — UAN: <b>{SYNTHETIC_CITIZEN.evaluationUan}</b> · Password: <b>{SYNTHETIC_CITIZEN.evaluationPassword}</b> · OTP: <b>{demoOtp || "— (sent after captcha)"}</b></span>
        <button type="button" onClick={() => dispatch("RESET")} className="underline hover:text-[#1a4b8e] focus:outline-none focus:ring-2 focus:ring-[#1a4b8e]">Restart simulated session</button>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm" aria-label="Simulated government portal marquee">
        <div className="border-b border-slate-200 bg-[#fdf6e3] py-1 text-[12px] text-[#8a6d00]" aria-hidden>
          <div className="whitespace-nowrap will-change-transform" style={{ animation: "govmarquee 28s linear infinite" }}>
            {MARQUEE_ITEMS.map((m) => <span key={m} className="mr-16">&nbsp;&nbsp;◆&nbsp;&nbsp;{m}</span>)}
          </div>
          <style jsx>{`@keyframes govmarquee { from { transform: translateX(100vw); } to { transform: translateX(-200vw); } } @media (prefers-reduced-motion: reduce) { div[style*="govmarquee"] { animation: none; } }`}</style>
        </div>

        <section className="p-5 sm:p-6">
          <p className="text-[12px] text-slate-500">Home » Members » <u>Online Claim Status</u> · Session: {snapshot.state.replaceAll("_", " ")}</p>
          {error && <p role="alert" className="mb-4 mt-3 rounded-sm border-l-4 border-red-700 bg-red-50 p-3 text-[13px] text-red-900">{error}</p>}

          {snapshot.state === PORTAL_STATES.LOGIN_FRICTION && (
            <section className={cardCls}>
              <div className={sectionHead}>{t(lang, "portalLogin")}</div>
              <div className="p-5">
                <table className="w-full max-w-xl text-[13px]"><tbody>
                  <tr><td className="w-56 py-1.5 pr-4"><label htmlFor="uan">UAN:</label></td><td className="py-1.5"><input id="uan" value={uan} onChange={(e) => setUan(e.target.value)} aria-label="UAN — 12 digits" placeholder="12-digit UAN" className="w-52 rounded-sm border border-slate-300 px-2 py-1 text-[13px] focus:border-[#1a4b8e] focus:ring-1 focus:ring-[#1a4b8e]" autoComplete="username" /></td></tr>
                  <tr><td className="py-1.5 pr-4"><label htmlFor="pwd">Password:</label></td><td className="py-1.5"><input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password" placeholder="demo1234" className="w-52 rounded-sm border border-slate-300 px-2 py-1 text-[13px] focus:border-[#1a4b8e] focus:ring-1 focus:ring-[#1a4b8e]" autoComplete="current-password" /></td></tr>
                  <tr><td className="py-1.5 pr-4 align-top"><label htmlFor="cap">Enter Captcha:</label></td><td className="py-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <button type="button" onClick={refreshCaptcha} aria-label="Refresh captcha — click to get new characters" title="Click to refresh captcha" className="select-none rounded-sm border border-slate-400 bg-[#2f2f2f] px-4 py-1.5 font-mono text-lg italic tracking-[0.35em] text-lime-300 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#1a4b8e]">{captchaText || "·····"}</button>
                      <button type="button" onClick={refreshCaptcha} aria-label="Generate new captcha" className="rounded-sm border border-slate-300 bg-white px-2 py-1 text-[12px] hover:border-[#1a4b8e] focus:outline-none focus:ring-2 focus:ring-[#1a4b8e]">↻ Refresh</button>
                      <input id="cap" value={captcha} onChange={(e) => setCaptcha(e.target.value)} aria-label="Captcha characters — case insensitive" placeholder="Enter above" className="w-36 rounded-sm border border-slate-300 px-2 py-1 text-[13px] focus:border-[#1a4b8e] focus:ring-1 focus:ring-[#1a4b8e]" autoComplete="off" />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">Captcha refreshes randomly on every click/refresh and on every failed attempt (crypto.randomBytes). Case-insensitive, no spaces. <button type="button" onClick={refreshCaptcha} className="underline hover:text-[#1a4b8e]">Need new one?</button></p>
                  </td></tr>
                  <tr><td colSpan={2} className="pt-3">
                    <button type="button" onClick={() => dispatch("VERIFY_CAPTCHA")} disabled={busy || !uan.trim() || password.length < 4 || !captcha.trim()} className={btnPrimary} aria-busy={busy}>{busy ? "Verifying…" : "Verify & Proceed → OTP"}</button>
                    <p className="mt-2 text-[11px] text-slate-500">Server validates UAN (12 digits), password, and captcha together — not just captcha. Wrong any → new captcha, no OTP.</p>
                  </td></tr>
                </tbody></table>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.OTP_REQUIRED && (
            <section className={cardCls}>
              <div className={sectionHead}>{t(lang, "portalOtp")}</div>
              <div className="p-5">
                <p className="text-[13px] text-slate-700">An OTP has been sent to your registered mobile ending <b>XXXX-XXXX-1234</b> (synthetic). This demo shows the OTP inline for evaluation — real EPFO sends via SMS gateway.</p>
                {demoOtp && <p className="mt-2 rounded-sm border border-amber-300 bg-[#fff8e6] px-3 py-2 text-[13px] text-[#8a6d00]"><b>Demo OTP:</b> <span className="font-mono text-lg tracking-widest">{demoOtp}</span> <span className="text-[11px]">(expires in 5 min, 3 attempts max)</span></p>}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <input value={otp} onChange={(e) => setOtp(e.target.value)} aria-label="6-digit OTP" placeholder="Enter 6-digit OTP" className="w-40 rounded-sm border border-slate-300 px-2 py-1.5 text-[13px] focus:border-[#1a4b8e] focus:ring-1 focus:ring-[#1a4b8e]" maxLength={6} autoComplete="one-time-code" />
                  <button type="button" onClick={() => dispatch("VERIFY_OTP")} disabled={busy || otp.trim().length !== 6} className={btnPrimary} aria-busy={busy}>{busy ? "Verifying…" : "Verify OTP"}</button>
                  <button type="button" onClick={() => dispatch("RESEND_OTP")} disabled={busy} className={btnOutline}>Resend OTP</button>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">OTP is 6-digit crypto-random, 5-min expiry, 3-attempt lock — then auto-refreshed. Database: OTP stored only in server session (httpOnly cookie), never in client or DB.</p>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.CLAIM_FORM && (
            <section className={cardCls}>
              <div className={sectionHead}>{t(lang, "claimForm")}</div>
              <div className="p-5">
                <table className="w-full max-w-2xl text-[13px]"><tbody>
                  <tr><td className={`${th} w-64`}>Name of Member</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.nameAsPerAadhaar}</td></tr>
                  <tr><td className={th}>Service (as per records)</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.serviceYears} years</td></tr>
                  <tr><td className={th}>Purpose of Advance</td><td className="border border-slate-300 px-2 py-1">Medical Treatment — Illness of family member (Para 68-J)</td></tr>
                  <tr><td className={th}>Bank Account (IFSC)</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.bankIfsc}</td></tr>
                  <tr><td className={th}>Amount Required</td><td className="border border-slate-300 px-2 py-1">₹ 50,000/- (Rupees Fifty Thousand only)</td></tr>
                </tbody></table>
                <label className="mt-4 flex max-w-xl items-start gap-2 text-[12px] leading-snug"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#1a4b8e] focus:ring-[#1a4b8e]" /> <span>I hereby declare that the particulars furnished above are true and correct, and I have read and agree to the <Link href="/terms" target="_blank" className="underline text-[#1a4b8e] focus:outline-none focus:ring-2 focus:ring-[#1a4b8e]">Terms & Conditions (RBI TAT 2019, CPA 2019, DPDP 2023, GIGW 3.0 — latest 22 Aug 2026)</Link>. All data is synthetic.</span></label>
                {!terms && <p className="mt-2 text-[11px] text-amber-700">Please accept the Terms & Conditions to submit — required for hackathon honesty + DPDP consent.</p>}
                <div className="mt-4"><button type="button" onClick={() => dispatch("SUBMIT_ADVANCE_CLAIM")} disabled={busy || !terms} className={btnPrimary} aria-disabled={busy || !terms}>{busy ? "Submitting…" : "Submit Claim Form-31"}</button> <Link href="/terms" target="_blank" className={btnOutline + " ml-2"}>Read Terms</Link></div>
                <p className="mt-2 text-[11px] text-slate-500">Database: claim stored in hash-chained ledger (SHA-256, append-only, per-process synthetic), not in browser. OTP/captcha server-session only. Synthetic only — no real money moved.</p>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.UNDER_PROCESS && (
            <section className={cardCls}>
              <div className={sectionHead}>Online Claim Status — Tracking ID: {SYNTHETIC_CITIZEN.claimTrackingId}</div>
              <div className="p-5">
                <table className="w-full max-w-2xl text-[13px]"><thead><tr><th className={th}>Date</th><th className={th}>Event</th><th className={th}>Remarks</th></tr></thead><tbody>
                  <tr><td className="border border-slate-300 px-2 py-1">Day 1</td><td className="border border-slate-300 px-2 py-1">Claim Received</td><td className="border border-slate-300 px-2 py-1">Under Process at Field Office</td></tr>
                  <tr><td className="border border-slate-300 px-2 py-1">Day {snapshot.simulatedDays}</td><td className="border border-slate-300 px-2 py-1">Status Check</td><td className="border border-slate-300 px-2 py-1">Your request is under process. Please do not submit another claim.</td></tr>
                </tbody></table>
                <p className="mt-3 text-[12px] text-slate-500">Simulated day {snapshot.simulatedDays} of {PROCESSING_DAYS}. No further explanation is available on the portal. For grievances, kindly approach the concerned office.</p>
                <div className="mt-4"><button type="button" onClick={() => dispatch("ADVANCE_DAY")} disabled={busy} className={btnOutline}>{busy ? "Loading…" : "Check Again Tomorrow (advance simulated day)"}</button></div>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.REJECTED && (
            <section className={cardCls}>
              <div className={sectionHead}>Online Claim Status — Tracking ID: {SYNTHETIC_CITIZEN.claimTrackingId}</div>
              <div className="p-5">
                <div className="max-w-2xl border-l-4 border-red-700 bg-red-50 p-3 text-[13px]"><b>Claim Rejected.</b><br />Reason: Name on requested Member ID and Primary UAN does not match. Kindly contact your employer for KYC updation.</div>
                <table className="mt-4 w-full max-w-2xl text-[13px]"><thead><tr><th className={th}>Particulars</th><th className={th}>As per Office Record</th></tr></thead><tbody>
                  <tr><td className="border border-slate-300 px-2 py-1">Requested Member ID Name</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.nameAsPerEmployer}</td></tr>
                  <tr><td className="border border-slate-300 px-2 py-1">Primary UAN Name</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.nameAsPerAadhaar}</td></tr>
                  <tr><td className="border border-slate-300 px-2 py-1">Comparison</td><td className="border border-slate-300 px-2 py-1 font-bold text-green-800">IDENTICAL — the stated rejection reason is contradicted by the portal's own displayed record.</td></tr>
                </tbody></table>
                <p className="mt-2 text-[11px] text-slate-500">(This comparison table is rendered by the simulation to expose the contradiction. The real portal displays nothing.)</p>
                <div className="mt-4"><button type="button" onClick={() => dispatch("OPEN_GRIEVANCE")} disabled={busy} className={btnPrimary}>{busy ? "Loading…" : "File Grievance Regarding This Rejection"}</button></div>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.GRIEVANCE_FORM && (
            <section className={cardCls}>
              <div className={sectionHead}>Grievance Management System (GMIS) — Register New Grievance</div>
              <div className="p-5 text-[13px]">
                <p>Please enter the Claim Tracking ID exactly as supplied in your rejection notice:</p>
                <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder={`e.g. ${SYNTHETIC_CITIZEN.claimTrackingId}`} className={`${inputCls} mt-2 max-w-xs`} aria-label="Claim Tracking ID" />
                <p className="mt-2 text-[11px] text-slate-500">Note: Tracking ID is case-sensitive and must match departmental records. Improper entries will invalidate the grievance attempt.</p>
                <div className="mt-4"><button type="button" onClick={() => dispatch("SUBMIT_GRIEVANCE")} disabled={busy || !trackingId.trim()} className={btnPrimary}>{busy ? "Submitting…" : "Submit Grievance"}</button></div>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.GRIEVANCE_INVALID_TRACKING && (
            <section className={cardCls}>
              <div className={sectionHead}>Grievance Management System (GMIS)</div>
              <div className="p-5 text-[13px]">
                <div className="max-w-2xl border-l-4 border-red-700 bg-red-50 p-3"><b>Error: Invalid Tracking ID.</b><br />The tracking ID cannot be verified against departmental records. Please try again later.</div>
                <p className="mt-3 text-[12px] text-slate-500">No grievance has been registered. One grievance attempt has been recorded against this claim.</p>
                <div className="mt-4"><button type="button" onClick={() => dispatch("OPEN_GRIEVANCE")} disabled={busy} className={btnOutline}>{busy ? "Loading…" : "Attempt Another Grievance"}</button></div>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.GRIEVANCE_LOCKED_OUT && (
            <section className={cardCls}>
              <div className={sectionHead}>Grievance Management System (GMIS)</div>
              <div className="p-5 text-[13px]">
                <div className="max-w-2xl border-l-4 border-red-700 bg-red-50 p-3"><b>Grievance Unavailable.</b><br />Next grievance allowed in 30 days. A grievance attempt has already been recorded for this claim.</div>
                <table className="mt-4 w-full max-w-2xl text-[13px]"><tbody>
                  <tr><td className={`${th} w-72`}>Available Escalation Options</td><td className="border border-slate-300 px-2 py-1">None displayed. Citizen may approach the Regional Office in person during working hours (Mon–Fri, 09:45–17:30).</td></tr>
                </tbody></table>
                <p className="mt-3 text-[11px] text-slate-500">Fix it with FIXER.OS: <a href="/fixer" className="underline text-[#1a4b8e]">Open Agent Console → Run next step → Download escalation letter (CPA 2019 §2(11))</a></p>
              </div>
            </section>
          )}
        </section>
      </div>

      <p className="mt-4 rounded-md border border-slate-300 bg-white p-3 text-[12px] leading-relaxed text-slate-600">
        <b>Database & safety (submission-safe):</b> No real DB, no real IDs. Portal sessions are httpOnly cookies (30-min TTL, server-owned FSM), OTP is server-session only (5-min, 3-attempt, crypto-random), ledger is SHA-256 append-only per-process (synthetic seed only). Rate limit 30/min, zod on every input, CSP headers. Even as hackathon prototype, it follows RBI TAT, CPA 2019, DPDP 2023 phased, GIGW 3.0. Try wrong captcha/password/OTP — each refreshes randomly and is validated server-side, not in browser.
      </p>
    </GovShell>
  );
}
