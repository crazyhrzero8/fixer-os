"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { initialPortalSnapshot, portalCitizen, PORTAL_STATES, PROCESSING_DAYS, type PortalAction, type PortalSnapshot } from "@/lib/portalFsm";
import { SYNTHETIC_CITIZEN } from "@/data/seed";

const NAV = ["Home", "Member Passbook", "Claim Status", "Register Grievance", "Establishment Search", "Contact Us"];
const MARQUEE_ITEMS = [
  "Attention Employers: ECR filing for the wage month has been extended till 15th of this month.",
  "Members may please note that OTP based authentication is mandatory for availing online services.",
  "This site is best viewed in 1024x768 resolution in Internet Explorer 9.0 or above.",
];

export default function Portal() {
  const [snapshot, setSnapshot] = useState<PortalSnapshot>(initialPortalSnapshot);
  const [captchaText, setCaptchaText] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [uan, setUan] = useState(SYNTHETIC_CITIZEN.evaluationUan);
  const [password, setPassword] = useState(SYNTHETIC_CITIZEN.evaluationPassword);
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

  const btn = "cursor-pointer rounded-sm border border-[#1a4b8e] bg-gradient-to-b from-[#f7f7f7] to-[#dfe6ef] px-3 py-1 text-[13px] font-normal text-[#1a4b8e] hover:bg-[#e8eef7]";
  const inputCls = "mt-1 w-full border border-[#7f9db9] bg-white px-2 py-1 text-[13px] text-black outline-none focus:border-[#1a4b8e]";
  const th = "border border-[#b8c4d0] bg-[#dbe5f1] px-3 py-1.5 text-left text-[12px] font-bold uppercase tracking-wide";

  return <div className="min-h-screen bg-white font-serif text-black" style={{ fontFamily: "'Times New Roman', 'Noto Serif', serif" }}>
    <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
    <div className="bg-[#fff3cd] px-4 py-1 text-center text-[11px] text-[#664d03]">
      SIMULATION ONLY — independent hackathon prototype. Not affiliated with EPFO or any Government body. All data synthetic.
      <b> Evaluation login — UAN: 100000000000 · Password: demo1234</b>
    </div>

    <header className="border-b-2 border-[#1a4b8e] bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#1a4b8e] bg-[#f0f4fa] text-[9px] leading-tight text-[#1a4b8e]">STATE<br />EMBLEM<br />PLACEHOLDER</div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#555]">Government of India (Simulated) · Ministry of Labour &amp; Employment</p>
            <h1 className="text-xl font-bold text-[#1a4b8e] sm:text-2xl">Employees&apos; Provident Fund Organisation</h1>
            <p className="text-[11px] italic text-[#777]">कर्मचारी भविष्य निधि संगठन — Simulated Member e-Sewa Portal</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-[11px] text-[#333]">
          <div className="flex items-center gap-1"><button type="button" className="rounded border px-1.5 py-0.5 hover:bg-gray-100">हिन्दी</button><button type="button" className="rounded border border-[#1a4b8e] bg-[#1a4b8e] px-1.5 py-0.5 text-white">English</button><span className="ml-2">|&nbsp; A<sup>-</sup>&nbsp; A&nbsp; A<sup>+</sup></span></div>
          <div className="flex items-center gap-1"><input className="border border-[#7f9db9] px-2 py-0.5 text-[12px]" placeholder="Search this website" /><button className={btn} type="button">Search</button></div>
          <span className="text-slate-500">Last updated: 21 August 2026 · Visitor No. 04,71,83,209</span>
        </div>
      </div>
    </header>

    <nav className="bg-[#1a4b8e] text-white">
      <ul className="mx-auto flex max-w-6xl flex-wrap px-2 text-[13px]">
        {NAV.map((item, i) => <li key={item} className={`px-3 py-2 ${i === 2 ? "bg-[#123763] font-bold" : ""} cursor-pointer hover:bg-[#123763]`}>{item}</li>)}
      </ul>
    </nav>

    <div className="overflow-hidden border-b border-[#ccc] bg-[#fdf6e3] py-1 text-[12px] text-[#8a6d00]">
      <div className="whitespace-nowrap will-change-transform" style={{ animation: "govmarquee 28s linear infinite" }}>
        {MARQUEE_ITEMS.map((m) => <span className="mr-16">&nbsp;&nbsp;◆&nbsp;&nbsp;{m}</span>)}
      </div>
      <style jsx>{`@keyframes govmarquee { from { transform: translateX(100vw); } to { transform: translateX(-200vw); } } @media (prefers-reduced-motion: reduce) { div[style*="govmarquee"] { animation: none; } }`}</style>
    </div>

    <div className="mx-auto max-w-6xl px-4 py-3 text-[12px] text-[#1a4b8e]">
      Home <span className="text-[#888]">»</span> Members <span className="text-[#888]">»</span> <u>Online Claim Status</u>
    </div>

    <main className="mx-auto max-w-6xl px-4 pb-10">
      {error && <p role="alert" className="mb-4 border-l-4 border-red-700 bg-red-50 p-3 text-[13px] text-red-900">{error}</p>}

      {snapshot.state === PORTAL_STATES.LOGIN_FRICTION && <section className="border border-[#b8c4d0]">
        <div className="border-b border-[#b8c4d0] bg-gradient-to-b from-[#eef3f9] to-[#dfe8f3] px-4 py-2 text-[15px] font-bold text-[#1a4b8e]">Member Login — Universal Account Number (UAN)</div>
        <div className="p-5">
          <table className="w-full max-w-xl text-[13px]"><tbody>
            <tr><td className="py-1 pr-4 w-56">UAN:</td><td className="py-1"><input value={uan} onChange={(e) => setUan(e.target.value)} className="w-52 border border-[#7f9db9] px-2 py-1 text-[13px]" aria-label="UAN" /></td></tr>
            <tr><td className="py-1 pr-4">Password:</td><td className="py-1"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-52 border border-[#7f9db9] px-2 py-1 text-[13px]" aria-label="Password" /></td></tr>
            <tr><td className="py-1 pr-4">Enter Captcha Characters:</td><td className="py-1">
              <div className="flex items-center gap-3">
                <span className="select-none border border-[#999] bg-[#2f2f2f] px-4 py-1.5 font-mono text-lg italic tracking-[0.35em] text-lime-300" style={{ textDecoration: "line-through dotted" }}>{captchaText || "·····"}</span>
                <input value={captcha} onChange={(e) => setCaptcha(e.target.value)} aria-label="Captcha" className="w-40 border border-[#7f9db9] px-2 py-1 text-[13px]" />
              </div>
              <p className="mt-1 text-[11px] text-[#777]">(Characters are case-insensitive. Kindly enter without spaces.)</p>
            </td></tr>
            <tr><td colSpan={2} className="pt-3"><button onClick={() => dispatch("VERIFY_CAPTCHA")} disabled={busy || !uan.trim() || password.length < 4 || !captcha.trim()} className={btn}>{busy ? "Verifying…" : "Verify &amp; Proceed"}</button></td></tr>
          </tbody></table>
        </div>
      </section>}

      {snapshot.state === PORTAL_STATES.CLAIM_FORM && <section className="border border-[#b8c4d0]">
        <div className="border-b border-[#b8c4d0] bg-gradient-to-b from-[#eef3f9] to-[#dfe8f3] px-4 py-2 text-[15px] font-bold text-[#1a4b8e]">Form-31 : Advance from Provident Fund Account (Member Self-Service)</div>
        <div className="p-5">
          <table className="w-full max-w-2xl text-[13px]"><tbody>
            <tr><td className="th w-64">Name of Member</td><td className="border border-[#b8c4d0] px-2 py-1">{portalCitizen.nameAsPerAadhaar}</td></tr>
            <tr><td className="th">Service (as per records)</td><td className="border border-[#b8c4d0] px-2 py-1">{portalCitizen.serviceYears} years</td></tr>
            <tr><td className="th">Purpose of Advance</td><td className="border border-[#b8c4d0] px-2 py-1">Medical Treatment — Illness of family member (Para 68-J)</td></tr>
            <tr><td className="th">Bank Account (IFSC)</td><td className="border border-[#b8c4d0] px-2 py-1">{portalCitizen.bankIfsc}</td></tr>
            <tr><td className="th">Amount Required</td><td className="border border-[#b8c4d0] px-2 py-1">₹ 50,000/- (Rupees Fifty Thousand only)</td></tr>
          </tbody></table>
          <label className="mt-4 block max-w-xl text-[12px]"><input type="checkbox" checked disabled /> I hereby declare that the particulars furnished above are true and correct.</label>
          <div className="mt-4"><button onClick={() => dispatch("SUBMIT_ADVANCE_CLAIM")} disabled={busy} className={btn}>{busy ? "Submitting…" : "Submit Claim Form-31"}</button></div>
        </div>
      </section>}

      {snapshot.state === PORTAL_STATES.UNDER_PROCESS && <section className="border border-[#b8c4d0]">
        <div className="border-b border-[#b8c4d0] bg-gradient-to-b from-[#eef3f9] to-[#dfe8f3] px-4 py-2 text-[15px] font-bold text-[#1a4b8e]">Online Claim Status — Tracking ID: {SYNTHETIC_CITIZEN.claimTrackingId}</div>
        <div className="p-5">
          <table className="w-full max-w-2xl text-[13px]"><thead><tr><th className={th}>Date</th><th className={th}>Event</th><th className={th}>Remarks</th></tr></thead><tbody>
            <tr><td className="border px-2 py-1">Day 1</td><td className="border px-2 py-1">Claim Received</td><td className="border px-2 py-1">Under Process at Field Office</td></tr>
            <tr><td className="border px-2 py-1">Day {snapshot.simulatedDays}</td><td className="border px-2 py-1">Status Check</td><td className="border px-2 py-1">Your request is under process. Please do not submit another claim.</td></tr>
          </tbody></table>
          <p className="mt-3 text-[12px] text-[#777]">Simulated day {snapshot.simulatedDays} of {PROCESSING_DAYS}. No further explanation is available on the portal. For grievances, kindly approach the concerned office.</p>
          <div className="mt-4"><button onClick={() => dispatch("ADVANCE_DAY")} disabled={busy} className={btn}>{busy ? "Loading…" : "Check Again Tomorrow (advance simulated day)"}</button></div>
        </div>
      </section>}

      {snapshot.state === PORTAL_STATES.REJECTED && <section className="border border-[#b8c4d0]">
        <div className="border-b border-[#b8c4d0] bg-gradient-to-b from-[#eef3f9] to-[#dfe8f3] px-4 py-2 text-[15px] font-bold text-[#1a4b8e]">Online Claim Status — Tracking ID: {SYNTHETIC_CITIZEN.claimTrackingId}</div>
        <div className="p-5">
          <div className="max-w-2xl border-l-4 border-red-700 bg-red-50 p-3 text-[13px]"><b>Claim Rejected.</b><br />Reason: Name on requested Member ID and Primary UAN does not match. Kindly contact your employer for KYC updation.</div>
          <table className="mt-4 w-full max-w-2xl text-[13px]"><thead><tr><th className={th}>Particulars</th><th className={th}>As per Office Record</th></tr></thead><tbody>
            <tr><td className="border px-2 py-1">Requested Member ID Name</td><td className="border px-2 py-1">{portalCitizen.nameAsPerEmployer}</td></tr>
            <tr><td className="border px-2 py-1">Primary UAN Name</td><td className="border px-2 py-1">{portalCitizen.nameAsPerAadhaar}</td></tr>
            <tr><td className="border px-2 py-1">Comparison</td><td className="border px-2 py-1 font-bold text-green-800">IDENTICAL — the stated rejection reason is contradicted by the portal&apos;s own displayed record.</td></tr>
          </tbody></table>
          <p className="mt-2 text-[11px] text-[#777]">(This comparison table is rendered by the simulation to expose the contradiction. The real portal displays nothing.)</p>
          <div className="mt-4"><button onClick={() => dispatch("OPEN_GRIEVANCE")} disabled={busy} className={btn}>{busy ? "Loading…" : "File Grievance Regarding This Rejection"}</button></div>
        </div>
      </section>}

      {snapshot.state === PORTAL_STATES.GRIEVANCE_FORM && <section className="border border-[#b8c4d0]">
        <div className="border-b border-[#b8c4d0] bg-gradient-to-b from-[#eef3f9] to-[#dfe8f3] px-4 py-2 text-[15px] font-bold text-[#1a4b8e]">Grievance Management System (GMIS) — Register New Grievance</div>
        <div className="p-5 text-[13px]">
          <p>Please enter the Claim Tracking ID exactly as supplied in your rejection notice:</p>
          <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="PF/2026/A/XXXXXXX" className={`${inputCls} mt-2 max-w-xs`} />
          <p className="mt-2 text-[11px] text-[#777]">Note: Tracking ID is case-sensitive and must match departmental records. Improper entries will invalidate the grievance attempt.</p>
          <div className="mt-4"><button onClick={() => dispatch("SUBMIT_GRIEVANCE")} disabled={busy || !trackingId.trim()} className={btn}>{busy ? "Submitting…" : "Submit Grievance"}</button></div>
        </div>
      </section>}

      {snapshot.state === PORTAL_STATES.GRIEVANCE_INVALID_TRACKING && <section className="border border-[#b8c4d0]">
        <div className="border-b border-[#b8c4d0] bg-gradient-to-b from-[#eef3f9] to-[#dfe8f3] px-4 py-2 text-[15px] font-bold text-[#1a4b8e]">Grievance Management System (GMIS)</div>
        <div className="p-5 text-[13px]">
          <div className="max-w-2xl border-l-4 border-red-700 bg-red-50 p-3"><b>Error: Invalid Tracking ID.</b><br />The tracking ID cannot be verified against departmental records. Please try again later.</div>
          <p className="mt-3 text-[12px] text-[#777]">No grievance has been registered. One grievance attempt has been recorded against this claim.</p>
          <div className="mt-4"><button onClick={() => dispatch("OPEN_GRIEVANCE")} disabled={busy} className={btn}>{busy ? "Loading…" : "Attempt Another Grievance"}</button></div>
        </div>
      </section>}

      {snapshot.state === PORTAL_STATES.GRIEVANCE_LOCKED_OUT && <section className="border border-[#b8c4d0]">
        <div className="border-b border-[#b8c4d0] bg-gradient-to-b from-[#eef3f9] to-[#dfe8f3] px-4 py-2 text-[15px] font-bold text-[#1a4b8e]">Grievance Management System (GMIS)</div>
        <div className="p-5 text-[13px]">
          <div className="max-w-2xl border-l-4 border-red-700 bg-red-50 p-3"><b>Grievance Unavailable.</b><br />Next grievance allowed in 30 days. A grievance attempt has already been recorded for this claim.</div>
          <table className="mt-4 w-full max-w-2xl text-[13px]"><tbody>
            <tr><td className="th w-72">Available Escalation Options</td><td className="border px-2 py-1">None displayed. Citizen may approach the Regional Office in person during working hours (Mon–Fri, 09:45–17:30).</td></tr>
          </tbody></table>
        </div>
      </section>}

      <button className="mt-8 text-[11px] text-[#1a4b8e] underline" onClick={() => dispatch("RESET")}>Restart simulated portal session</button>
    </main>

    <footer className="mt-6 border-t-4 border-[#FF9933] bg-[#f5f7fa]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 p-6 text-[12px] text-[#444] sm:grid-cols-4">
        {[["About Us", ["History", "Vision & Mission", "Organisation Chart"]], ["Services", ["UAN Card", "Passbook", "Claim Forms"]], ["Grievances", ["GMIS Portal", "CPGRAMS", "Public Grivances"]], ["Links", ["RTI Act", "Downloads", "Tenders", "FAQs"]]].map(([title, items]) => (
          <div key={title as string}><p className="mb-2 font-bold text-[#1a4b8e] underline">{title as string}</p><ul className="space-y-1">{(items as string[]).map((it) => <li key={it} className="cursor-pointer hover:text-[#1a4b8e] hover:underline">» {it}</li>)}</ul></div>
        ))}
      </div>
      <div className="border-t border-[#ddd] px-4 py-3 text-center text-[11px] text-[#666]">
        Website content managed and maintained by (simulated) organisation. Website designed, developed and hosted by National Informatics Centre (simulated).<br />
        Best viewed in Internet Explorer 9+ / Chrome 30+, resolution 1024x768 · Last reviewed: 21/08/2026<br />
        <span className="text-[#a33]">Simulation for the Build What Moves India hackathon — deliberately faithful UX reconstruction, zero affiliation.</span>
      </div>
    </footer>

    <Link href="/" className="block pb-6 pt-3 text-center text-[12px] text-[#1a4b8e] underline">« Back to FIXER.OS console</Link>
  </div>;
}
