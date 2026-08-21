"use client";

import Link from "next/link";
import { useState } from "react";
import { initialPortalSnapshot, portalCitizen, PORTAL_STATES, PROCESSING_DAYS, type PortalAction, type PortalSnapshot } from "@/lib/portalFsm";

const inputClass = "mt-2 w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-200";

export default function Portal() {
  const [snapshot, setSnapshot] = useState<PortalSnapshot>(initialPortalSnapshot);
  const [captcha, setCaptcha] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function dispatch(action: PortalAction) {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/portal/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, snapshot }) });
      const result = (await response.json()) as { snapshot?: PortalSnapshot; error?: string };
      if (!response.ok || !result.snapshot) throw new Error(result.error ?? "Portal unavailable.");
      setSnapshot(result.snapshot);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Portal unavailable."); }
    finally { setBusy(false); }
  }

  const Button = ({ action, children, disabled = false }: { action: PortalAction; children: React.ReactNode; disabled?: boolean }) => (
    <button onClick={() => dispatch(action)} disabled={busy || disabled} className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
      {busy ? "Processing…" : children}
    </button>
  );

  return <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
    <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl">
      <header className="border-b-4 border-blue-800 bg-slate-50 px-6 py-5">
        <p className="text-xs font-bold tracking-widest text-blue-800 uppercase">Employees&apos; Provident Fund — simulated portal</p>
        <h1 className="mt-1 text-2xl font-bold">Member e-Sewa</h1>
        <p className="mt-1 text-xs text-slate-500">Demonstration only. All details are synthetic; no government system is involved.</p>
      </header>
      <section className="p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b pb-3 text-xs text-slate-500"><span>UAN: {portalCitizen.uan}</span><span>Session status: {snapshot.state.replaceAll("_", " ")}</span></div>
        {error && <p className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        {snapshot.state === PORTAL_STATES.LOGIN_FRICTION && <section>
          <h2 className="text-xl font-semibold">Member login</h2><p className="mt-2 text-sm text-slate-600">Enter the characters shown to continue. Refreshes are not available in this session.</p>
          <div className="mt-5 flex items-center gap-4"><span className="select-none rounded bg-slate-800 px-4 py-3 font-mono text-xl italic tracking-[0.3em] text-white">7 K 3 M</span><label className="text-sm">Captcha<input value={captcha} onChange={(e) => setCaptcha(e.target.value)} className={inputClass} aria-label="Captcha" /></label></div>
          <div className="mt-5"><Button action="VERIFY_CAPTCHA" disabled={captcha.trim().toUpperCase() !== "7K3M"}>Verify and continue</Button></div>
        </section>}
        {snapshot.state === PORTAL_STATES.CLAIM_FORM && <section>
          <h2 className="text-xl font-semibold">PF advance claim</h2><p className="mt-2 text-sm text-slate-600">Member: {portalCitizen.nameAsPerAadhaar} · Service: {portalCitizen.serviceYears} years</p>
          <div className="mt-5 grid gap-3 rounded bg-slate-50 p-4 text-sm"><p>Claim type: <b>Advance against PF balance</b></p><p>Purpose: <b>Medical treatment</b></p><p>Bank IFSC: <b>{portalCitizen.bankIfsc}</b></p></div><div className="mt-5"><Button action="SUBMIT_ADVANCE_CLAIM">Submit claim</Button></div>
        </section>}
        {snapshot.state === PORTAL_STATES.UNDER_PROCESS && <section>
          <h2 className="text-xl font-semibold">Claim status</h2><div className="mt-5 rounded border-l-4 border-amber-500 bg-amber-50 p-4"><p className="font-semibold text-amber-900">Under Process</p><p className="mt-1 text-sm text-amber-800">Your request is being processed. Please do not submit another claim.</p></div>
          <p className="mt-5 text-sm text-slate-600">Simulated day {snapshot.simulatedDays} of {PROCESSING_DAYS}. The portal gives no further explanation.</p><div className="mt-5"><Button action="ADVANCE_DAY">Wait one simulated day</Button></div>
        </section>}
        {snapshot.state === PORTAL_STATES.REJECTED && <section>
          <h2 className="text-xl font-semibold">Claim status</h2><div className="mt-5 rounded border-l-4 border-red-600 bg-red-50 p-4"><p className="font-semibold text-red-900">Rejected</p><p className="mt-2 text-sm font-medium text-red-900">Reason: Name on requested member ID and Primary UAN does not match</p></div>
          <div className="mt-5 rounded bg-slate-100 p-4 text-sm"><p className="font-semibold">Independent synthetic record</p><p className="mt-2">Requested member ID: <b>{portalCitizen.nameAsPerEmployer}</b></p><p>Primary UAN: <b>{portalCitizen.nameAsPerAadhaar}</b></p><p className="mt-2 text-emerald-700">Records match. The stated rejection is false.</p></div><div className="mt-5"><Button action="OPEN_GRIEVANCE">File a grievance</Button></div>
        </section>}
        {snapshot.state === PORTAL_STATES.GRIEVANCE_FORM && <section><h2 className="text-xl font-semibold">Register grievance</h2><p className="mt-2 text-sm text-slate-600">Enter the claim tracking ID supplied in your rejection notice.</p><label className="mt-5 block text-sm">Tracking ID<input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="e.g. PF-2026-001" className={inputClass} /></label><div className="mt-5"><Button action="SUBMIT_GRIEVANCE" disabled={!trackingId.trim()}>Submit grievance</Button></div></section>}
        {snapshot.state === PORTAL_STATES.GRIEVANCE_INVALID_TRACKING && <section><h2 className="text-xl font-semibold">Register grievance</h2><div className="mt-5 rounded border border-red-300 bg-red-50 p-4 text-red-900"><p className="font-semibold">Invalid tracking ID</p><p className="mt-1 text-sm">The tracking ID cannot be verified. Please try again later.</p></div><div className="mt-5"><Button action="OPEN_GRIEVANCE">Try another grievance</Button></div></section>}
        {snapshot.state === PORTAL_STATES.GRIEVANCE_LOCKED_OUT && <section><h2 className="text-xl font-semibold">Grievance unavailable</h2><div className="mt-5 rounded border-l-4 border-red-600 bg-red-50 p-4"><p className="font-semibold text-red-900">Next grievance allowed in 30 days</p><p className="mt-1 text-sm text-red-800">A grievance attempt has already been recorded for this claim.</p></div></section>}
        <button className="mt-10 text-xs text-slate-500 underline" onClick={() => dispatch("RESET")}>Restart simulated portal</button>
      </section>
    </div>
    <p className="mx-auto mt-5 max-w-3xl text-center text-xs text-slate-500"><Link href="/" className="underline">Back to FIXER.OS</Link> · Mocked hostile workflow for demonstration only.</p>
  </main>;
}
