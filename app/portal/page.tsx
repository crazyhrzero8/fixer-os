"use client";

import { useEffect, useState } from "react";
import { initialPortalSnapshot, portalCitizen, PORTAL_STATES, PROCESSING_DAYS, type PortalAction, type PortalSnapshot } from "@/lib/portalFsm";
import { SYNTHETIC_CITIZEN } from "@/data/seed";
import { GovShell, btnOutline, btnPrimary, cardCls } from "../govshell";

const MARQUEE_ITEMS = [
  "Attention Members: OTP-based authentication is mandatory for availing online services.",
  "Kindly keep your UAN, password and captcha characters ready before beginning.",
  "This demonstration portal replays documented real-world failure sequences."
];

const inputCls = "mt-1 w-full rounded-sm border border-slate-300 bg-white px-2 py-1.5 text-[13px] text-slate-900 outline-none focus:border-[#1a4b8e]";
const sectionHead = "border-b border-slate-300 bg-[#eef3f9] px-4 py-2 text-[15px] font-bold text-[#1a4b8e]";
const th = "border border-slate-300 bg-[#eef3f9] px-3 py-1.5 text-left text-[12px] font-bold uppercase tracking-wide";

export default function Portal() {
  const [snapshot, setSnapshot] = useState<PortalSnapshot>(initialPortalSnapshot);
  const [captchaText, setCaptchaText] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [uan, setUan] = useState<string>(SYNTHETIC_CITIZEN.evaluationUan);
  const [password, setPassword] = useState<string>(SYNTHETIC_CITIZEN.evaluationPassword);
  const [trackingId, setTrackingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch("/api/portal/action");
        const p = await r.json();
        if (p.spaced) setCaptchaText(p.spaced as string);
      } catch { setError("Captcha service unavailable. Kindly refresh the page."); }
    })();
  }, []);

  async function dispatch(action: PortalAction) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/portal/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, value: action === "VERIFY_CAPTCHA" ? captcha : undefined }) });
      const result = (await response.json()) as { snapshot?: PortalSnapshot; error?: string };
      if (!response.ok || !result.snapshot) throw new Error(result.error ?? "Portal unavailable.");
      setSnapshot(result.snapshot);
      if (result.error) setError(result.error);
      if (action === "VERIFY_CAPTCHA") {
        const refreshed = await fetch("/api/portal/action");
        const p = await refreshed.json();
        if (p.spaced) setCaptchaText(p.spaced as string);
        setCaptcha("");
      }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Portal unavailable."); }
    finally { setBusy(false); }
  }

  return (
    <GovShell active="/portal">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300 bg-[#fff8e6] px-4 py-2 text-[12px] text-[#8a6d00]">
        <span><b>Evaluation login</b> — UAN: <b>{SYNTHETIC_CITIZEN.evaluationUan}</b> · Password: <b>{SYNTHETIC_CITIZEN.evaluationPassword}</b></span>
        <button type="button" onClick={() => dispatch("RESET")} className="underline hover:text-[#1a4b8e]">Restart simulated session</button>
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
              <div className={sectionHead}>Member Login — Universal Account Number (UAN)</div>
              <div className="p-5">
                <table className="w-full max-w-xl text-[13px]"><tbody>
                  <tr><td className="w-56 py-1.5 pr-4">UAN:</td><td className="py-1.5"><input value={uan} onChange={(e) => setUan(e.target.value)} aria-label="UAN" className="w-52 rounded-sm border border-slate-300 px-2 py-1 text-[13px]" /></td></tr>
                  <tr><td className="py-1.5 pr-4">Password:</td><td className="py-1.5"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password" className="w-52 rounded-sm border border-slate-300 px-2 py-1 text-[13px]" /></td></tr>
                  <tr><td className="py-1.5 pr-4 align-top">Enter Captcha Characters:</td><td className="py-1.5">
                    <div className="flex items-center gap-3">
                      <span aria-hidden className="select-none rounded-sm border border-slate-400 bg-[#2f2f2f] px-4 py-1.5 font-mono text-lg italic tracking-[0.35em] text-lime-300">{captchaText || "·····"}</span>
                      <input value={captcha} onChange={(e) => setCaptcha(e.target.value)} aria-label="Captcha" className="w-40 rounded-sm border border-slate-300 px-2 py-1 text-[13px]" />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">(Characters are case-insensitive. Kindly enter without spaces.)</p>
                  </td></tr>
                  <tr><td colSpan={2} className="pt-3"><button type="button" onClick={() => dispatch("VERIFY_CAPTCHA")} disabled={busy || !uan.trim() || password.length < 4 || !captcha.trim()} className={btnPrimary}>{busy ? "Verifying…" : "Verify & Proceed"}</button></td></tr>
                </tbody></table>
              </div>
            </section>
          )}

          {snapshot.state === PORTAL_STATES.CLAIM_FORM && (
            <section className={cardCls}>
              <div className={sectionHead}>Form-31 : Advance from Provident Fund Account (Member Self-Service)</div>
              <div className="p-5">
                <table className="w-full max-w-2xl text-[13px]"><tbody>
                  <tr><td className={`${th} w-64`}>Name of Member</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.nameAsPerAadhaar}</td></tr>
                  <tr><td className={th}>Service (as per records)</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.serviceYears} years</td></tr>
                  <tr><td className={th}>Purpose of Advance</td><td className="border border-slate-300 px-2 py-1">Medical Treatment — Illness of family member (Para 68-J)</td></tr>
                  <tr><td className={th}>Bank Account (IFSC)</td><td className="border border-slate-300 px-2 py-1">{portalCitizen.bankIfsc}</td></tr>
                  <tr><td className={th}>Amount Required</td><td className="border border-slate-300 px-2 py-1">₹ 50,000/- (Rupees Fifty Thousand only)</td></tr>
                </tbody></table>
                <label className="mt-4 block max-w-xl text-[12px]"><input type="checkbox" checked disabled /> I hereby declare that the particulars furnished above are true and correct.</label>
                <div className="mt-4"><button type="button" onClick={() => dispatch("SUBMIT_ADVANCE_CLAIM")} disabled={busy} className={btnPrimary}>{busy ? "Submitting…" : "Submit Claim Form-31"}</button></div>
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
                <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder={`e.g. ${SYNTHETIC_CITIZEN.claimTrackingId}`} className={`${inputCls} mt-2 max-w-xs`} />
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
              </div>
            </section>
          )}
        </section>
      </div>

      <p className="mt-4 rounded-md border border-slate-300 bg-white p-3 text-[12px] leading-relaxed text-slate-600">
        This portal is a deliberately faithful simulation of documented public-service failures, used as the problem
        statement for the FIXER.OS accountability console. Every rejection, lockout and dead-end shown here has been
        reported by real citizens on public forums; all data on this page is synthetic.
      </p>
    </GovShell>
  );
}
