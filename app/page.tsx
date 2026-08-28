"use client";

import Link from "next/link";
import { GovShell, btnOutline, btnPrimary, cardCls } from "./govshell";
import { useLang, t } from "@/lib/i18n";

export default function Home() {
  const { lang } = useLang();
  return (
    <GovShell active="/">
      {/* Hero Section (Clean orientation without marketing fluff) */}
      <section className="mx-auto py-6 sm:py-8 text-center">
        <h2 className="text-3xl font-bold leading-tight text-[#1a4b8e] sm:text-4xl">
          {t(lang, "heroTitle")}
        </h2>
        <p className="mt-4 max-w-3xl mx-auto text-[14px] leading-relaxed text-slate-700">
          {t(lang, "heroDesc")}
        </p>
      </section>

      {/* Asymmetric Paths Grid */}
      <div className="mt-8 grid gap-8 md:grid-cols-2 items-stretch">
        
        {/* Path 1: Simulated Portal (Legacy/Bureaucratic, Dated Boxy Styling) */}
        <div className="flex flex-col justify-between border border-slate-300 bg-[#fafafa] p-5 rounded-none shadow-none text-left">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a4b8e] border-b border-slate-300 pb-2">
              {lang === "hi" ? "अनुकरित सदस्य पोर्टल (डेकॉय)" : "Simulated Member Portal (Decoy)"}
            </h3>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-600 font-sans font-medium">
              {lang === "hi"
                ? "अनुरूप सरकारी पोर्टल सिमुलेशन में प्रवेश करें। एक नागरिक के रूप में दावे दर्ज करें, कैप्चा हल करें और प्रलेखित विफलता प्रतिक्रियाओं को ट्रिगर करें।"
                : "Access the legacy government portal simulator. Act as a citizen to file claims, solve captcha lockouts, and trigger the documented mismatch rejection."}
            </p>
            <p className="mt-3 text-[11px] text-slate-400 font-serif italic">
              {lang === "hi" ? "UAN 100000000000 · पासवर्ड demo1234 का उपयोग करें" : "Use UAN 100000000000 · password demo1234 to authenticate"}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200">
            <Link href="/portal" className="bg-[#1a4b8e] hover:bg-[#123763] text-white font-bold text-xs uppercase py-2.5 px-4 rounded-none block w-full text-center transition">
              {t(lang, "choicePortalBtn")}
            </Link>
          </div>
        </div>

        {/* Path 2: Fixer OS Console (Ruled Dossier Style, Monospace details) */}
        <div className="flex flex-col justify-between border-y-2 border-[#d0daf0] bg-[#f0f4fa] p-5 rounded-none text-left text-[#1c1a17]">
          <div>
            <div className="flex justify-between items-center border-b border-[#d0daf0] pb-2 text-[10px] font-mono text-slate-400">
              <span>Folio 001 / AUDIT</span>
              <span className="text-[#2f6e4f] font-bold">SECURED</span>
            </div>
            <h3 className="mt-2 text-sm font-bold uppercase tracking-wider text-[#1a4b8e]">
              {lang === "hi" ? "जवाबदेही कंसोल (ऑडिट उपकरण)" : "Accountability Console (Audit Tool)"}
            </h3>
            <p className="mt-3 text-[12px] leading-relaxed text-slate-700 font-sans">
              {lang === "hi"
                ? "स्वतंत्र बहीखाता खोलें। नियमों के उल्लंघन की निगरानी करें, विलंब समय सीमा को ट्रैक करें, हैश श्रृंखला की पुष्टि करें और कानूनी अपील तैयार करें।"
                : "Open the audit ledger workspace. Monitor rule-compliance, trace case delay timelines, verify cryptographic hashes, and export legal appeals."}
            </p>
            <p className="mt-3 text-[10px] font-mono text-slate-400">
              {lang === "hi" ? "छेड़छाड़-रहित ऑडिट नोटबुक · e-SLA ट्रैकर" : "Tamper-evident Case Chain · e-SLA compliance ledger"}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#d0daf0]">
            <Link
              href="/fixer"
              onClick={() => sessionStorage.setItem("allowed_to_login", "true")}
              className="border border-[#1c1a17] text-[#1c1a17] bg-transparent hover:bg-[#e6effc] text-xs font-sans font-bold uppercase py-2.5 px-4 rounded-none block w-full text-center transition"
            >
              {t(lang, "choiceConsoleBtn")}
            </Link>
          </div>
        </div>

      </div>

      {/* Minimal Footer Links without Emojis */}
      <div className="mt-8 border-t border-slate-200 pt-6 grid gap-4 sm:grid-cols-2 text-center text-xs text-slate-500">
        <Link href="/demo" className="underline hover:text-[#1a4b8e]">{lang === "hi" ? "डेमो थिएटर (वीडियो तुलना देखें)" : "Demo Theater (Watch Video Comparison)"}</Link>
        <Link href="/terms" className="underline hover:text-[#1a4b8e]">{lang === "hi" ? "नियम व कानूनी आधार" : "Terms & Legal Citations"}</Link>
      </div>
    </GovShell>
  );
}
