"use client";

import Link from "next/link";
import { GovShell, btnOutline, btnPrimary, cardCls } from "./govshell";
import { useLang, t } from "@/lib/i18n";

const ROUTES = [
  {
    href: "/portal",
    title: "Simulated Portal — the problem, faithfully rebuilt",
    body: "A mock EPFO-style member portal that replays documented real-world failures: false rejections, invalid grievance IDs, 30-day lockouts."
  },
  {
    href: "/fixer",
    title: "Agent Console — the accountability layer",
    body: "Hash-chained evidence ledger, false-rejection audits, pre-flight rejection prediction, SLA clock accruing ₹100/day under RBI's TAT framework."
  },
  {
    href: "/demo",
    title: "Demo Theater — two outcomes, one citizen",
    body: "Split screen. Left: a citizen alone, stuck forever. Right: the same citizen with FIXER.OS. Watch resolution happen step by step."
  }
];

const EVIDENCE = [
  ["763 Mn/day", "UPI transactions — India's payment rails already work at world scale"],
  ["₹100/day", "RBI-mandated compensation for failed transactions that citizens almost never claim"],
  ["31 / 957", "government portals that passed their own GIGW usability audit"]
];

export default function Home() {
  const { lang } = useLang();
  return (
    <GovShell active="/">
      <section className={`${cardCls} mx-auto p-6 sm:p-8`}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">
          {t(lang, "heroEyebrow")}
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-[#1a4b8e] sm:text-4xl">
          {t(lang, "heroTitle")}
        </h2>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-slate-700">
          {t(lang, "heroDesc")}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {EVIDENCE.map(([stat, label]) => (
            <div key={stat} className="rounded-md border border-slate-200 bg-[#f8fafc] px-4 py-3">
              <p className="text-lg font-bold text-[#1a4b8e]">{stat}</p>
              <p className="mt-0.5 text-xs leading-snug text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {ROUTES.map((r) => (
          <Link key={r.href} href={r.href} className={`${cardCls} block p-5 transition hover:border-[#1a4b8e] hover:shadow-md`}>
            <h3 className="font-bold text-[#1a4b8e]">{r.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{r.body}</p>
            <p className="mt-3 text-[12px] font-semibold text-[#1a4b8e] underline">Open section »</p>
          </Link>
        ))}
      </div>

      <section className={`${cardCls} mt-6 flex flex-wrap items-center justify-between gap-4 p-5`}>
        <div>
          <h3 className="font-bold text-slate-900">{t(lang, "evalTitle")}</h3>
          <p className="mt-1 text-[13px] text-slate-600">
            {t(lang, "evalDesc")}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/portal" className={btnPrimary}>{lang === "hi" ? "पोर्टल में प्रवेश" : "Enter portal"}</Link>
          <Link href="/fixer" className={btnOutline}>{lang === "hi" ? "कंसोल खोलें" : "Open console"}</Link>
          <Link href="/terms" className={btnOutline}>{lang === "hi" ? "नियम देखें" : "View terms"}</Link>
        </div>
      </section>
    </GovShell>
  );
}
