"use client";

import Link from "next/link";
import { GovShell, btnOutline, btnPrimary, cardCls } from "./govshell";
import { useLang, t } from "@/lib/i18n";

export default function Home() {
  const { lang } = useLang();
  return (
    <GovShell active="/">
      <section className={`${cardCls} mx-auto p-6 sm:p-8 text-center`}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">
          {t(lang, "heroEyebrow")}
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-[#1a4b8e] sm:text-4xl">
          {t(lang, "heroTitle")}
        </h2>
        <p className="mt-4 max-w-3xl mx-auto text-[14px] leading-relaxed text-slate-700">
          {t(lang, "heroDesc")}
        </p>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Card 1: Simulated Portal */}
        <div className={`${cardCls} flex flex-col justify-between p-6 hover:border-[#1a4b8e]/50 hover:shadow-md transition`}>
          <div>
            <h3 className="text-xl font-bold text-[#1a4b8e]">{t(lang, "choicePortalTitle")}</h3>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
              {t(lang, "choicePortalDesc")}
            </p>
            <p className="mt-4 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded p-2.5">
              {t(lang, "bannerPortal")}
            </p>
          </div>
          <div className="mt-6">
            <Link href="/portal" className={`${btnPrimary} w-full text-center py-2.5 font-bold`}>
              {t(lang, "choicePortalBtn")}
            </Link>
          </div>
        </div>

        {/* Card 2: Fixer OS Console */}
        <div className={`${cardCls} flex flex-col justify-between p-6 hover:border-[#1a4b8e]/50 hover:shadow-md transition`}>
          <div>
            <h3 className="text-xl font-bold text-[#1a4b8e]">{t(lang, "choiceConsoleTitle")}</h3>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-600">
              {t(lang, "choiceConsoleDesc")}
            </p>
            <p className="mt-4 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded p-2.5">
              {t(lang, "bannerConsole")}
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/fixer"
              onClick={() => sessionStorage.setItem("allowed_to_login", "true")}
              className={`${btnOutline} w-full text-center py-2.5 font-bold`}
            >
              {t(lang, "choiceConsoleBtn")}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-6 grid gap-4 sm:grid-cols-2 text-center text-xs text-slate-500">
        <Link href="/demo" className="underline hover:text-[#1a4b8e]">🎬 {lang === "hi" ? "डेमो थिएटर (वीडियो तुलना देखें)" : "Demo Theater (Watch Video Comparison)"}</Link>
        <Link href="/terms" className="underline hover:text-[#1a4b8e]">📋 {lang === "hi" ? "नियम व कानूनी आधार" : "Terms & Legal Citations"}</Link>
      </div>
    </GovShell>
  );
}
