"use client";

import Link from "next/link";
import { GovShell, btnOutline, btnPrimary, cardCls } from "./govshell";
import { useLang, t } from "@/lib/i18n";

const CONTENT = {
  en: {
    routes: [
      { href: "/portal", icon: "🏛️", title: "Simulated Portal — the problem, faithfully rebuilt", body: "A mock EPFO-style member portal that replays documented real-world failures: false rejections, invalid grievance IDs, 30-day lockouts." },
      { href: "/fixer", icon: "🧾", title: "Agent Console — the accountability layer", body: "Hash-chained evidence ledger, false-rejection audits, pre-flight rejection prediction, SLA clock accruing ₹100/day under RBI's TAT framework." },
      { href: "/demo", icon: "🎬", title: "Demo Theater — two outcomes, one citizen", body: "Split screen. Left: a citizen alone, stuck forever. Right: the same citizen with FIXER.OS. Watch resolution happen step by step." },
      { href: "/terms", icon: "📋", title: "Terms & Legal Basis — cited, dated, live links", body: "RBI TAT 2019 · EPS 1995/2026 · CPA 2019 + 2021 jurisdiction rules · DPDP Act/Rules phased · GIGW 3.0 — all with primary sources." }
    ],
    evidence: [
      ["763 Mn/day", "UPI transactions — India's payment rails already work at world scale"],
      ["₹100/day", "RBI-mandated compensation for failed transactions that citizens almost never claim"],
      ["31 / 957", "government portals that passed their own GIGW usability audit"]
    ],
    updatesHead: "Latest Updates",
    updatesSub: "build log in CODEX_LOG.md",
    open: "Open section »",
    roadmap: [
      { icon: "🖨️", title: "Ledger-as-Receipt Printer", body: "Reprint any proof-of-payment from the hash chain when a portal refuses.", status: "🚧 Coming Soon (post-deadline)", ok: false },
      { icon: "📊", title: "Closure-Quality Index", body: "Scores grievance closures for copy-paste templates — weaponizes disposal KPIs back at the dashboard.", status: "🚧 Coming Soon (post-deadline)", ok: false },
      { icon: "✅", title: "False-Rejection Audit + SLA Clock", body: "Live today: ledger proof, RuleGuard deadlock math, ₹100/day RBI TAT clock, escalation drafts.", status: "Working now", ok: true }
    ],
    upd: [
      { date: "22 Aug", tag: "Latest", text: "Member Dashboard shipped — Passbook/KYC cards after OTP login (synthetic)." },
      { date: "22 Aug", tag: "Security", text: "AI payload PII-scrubbing live: UAN/PAN/IFSC/hashes redacted before any model call." },
      { date: "20 Aug", tag: "A11y", text: "हिन्दी toggle now translates content; font scaling 85–130%; focus rings standardized." }
    ]
  },
  hi: {
    routes: [
      { href: "/portal", icon: "🏛️", title: "नकली पोर्टल — समस्या, ईमानदारी से पुनर्निर्मित", body: "EPFO-शैली का नकली सदस्य पोर्टल जो दर्ज वास्तविक विफलताएँ दोहराता है: झूठी अस्वीकृतियाँ, अमान्य शिकायत-आईडी, 30-दिन ताला।" },
      { href: "/fixer", icon: "🧾", title: "एजेंट कंसोल — जवाबदेही परत", body: "हैश-शृंखलित साक्ष्य-बहीखाता, झूठी-अस्वीकृति जाँच, पूर्व-चेतावनी भविष्यवाणी, RBI TAT के अंतर्गत ₹100/दिन SLA घड़ी।" },
      { href: "/demo", icon: "🎬", title: "डेमो थिएटर — एक नागरिक, दो परिणाम", body: "विभाजित स्क्रीन। बाएँ: नागरिक अकेला, हमेशा अटका। दाएँ: वही नागरिक FIXER.OS के साथ। हल होते देखें।" },
      { href: "/terms", icon: "📋", title: "नियम व कानूनी आधार — उद्धृत, दिनांकित, लाइव लिंक", body: "RBI TAT 2019 · EPS 1995/2026 · CPA 2019 + 2021 क्षेत्राधिकार · DPDP अधिनियम/नियम · GIGW 3.0 — प्राथमिक स्रोतों सहित।" }
    ],
    evidence: [
      ["763 करोड़/दिन", "UPI लेन-देन — भारत के भुगतान-रेल पहले से विश्व-स्तरीय"],
      ["₹100/दिन", "असफल लेन-देन पर RBI-अधिदेशित मुआवज़ा जो नागरिक लगभग कभी नहीं पाते"],
      ["31 / 957", "सरकारी पोर्टल जो अपनी ही GIGW सुगम्यता-जाँच पास कर सके"]
    ],
    updatesHead: "नवीनतम अपडेट",
    updatesSub: "निर्माण-लॉग CODEX_LOG.md में",
    open: "खंड खोलें »",
    roadmap: [
      { icon: "🖨️", title: "बहीखाता-से-रसीद प्रिंटर", body: "पोर्टल इनकार करे तो हैश शृंखला से भुगतान-प्रमाण दोबारा छापें।", status: "🚧 शीघ्र (समय-सीमा के बाद)", ok: false },
      { icon: "📊", title: "निपटान-गुणवत्ता सूचकांक", body: "कॉपी-पेस्ट टेम्पलेट शिकायत-निपटान को स्कोर करे — KPI को ही जवाबदेह बनाए।", status: "🚧 शीघ्र (समय-सीमा के बाद)", ok: false },
      { icon: "✅", title: "झूठी-अस्वीकृति जाँच + SLA घड़ी", body: "आज लाइव: बहीखाता-प्रमाण, RuleGuard गतिरोध-गणित, ₹100/दिन RBI घड़ी, एस्केलेशन पत्र।", status: "अभी कार्यरत", ok: true }
    ],
    upd: [
      { date: "22 अग", tag: "नवीनतम", text: "सदस्य डैशबोर्ड जारी — OTP लॉगिन के बाद पासबुक/KYC कार्ड (कृत्रिम)।" },
      { date: "22 अग", tag: "सुरक्षा", text: "AI पेलोड PII-स्क्रबिंग लाइव: UAN/PAN/IFSC/हैश मॉडल-कॉल से पहले छिपाए जाते हैं।" },
      { date: "20 अग", tag: "सुगम्यता", text: "हिन्दी टॉगल अब सामग्री अनुवादित करता है; फॉन्ट स्केलिंग 85–130%; फ़ोकस रिंग मानक।" }
    ]
  }
};

export default function Home() {
  const { lang } = useLang();
  const c = CONTENT[lang === "hi" ? "hi" : "en"];
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
          {c.evidence.map(([stat, label]) => (
            <div key={stat} className="rounded-md border border-slate-200 bg-[#f8fafc] px-4 py-3">
              <p className="text-lg font-bold text-[#1a4b8e]">{stat}</p>
              <p className="mt-0.5 text-xs leading-snug text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {c.routes.map((r) => (
          <Link key={r.href} href={r.href} className={`${cardCls} block p-5 transition hover:border-[#1a4b8e] hover:shadow-md`}>
            <h3 className="font-bold text-[#1a4b8e]"><span aria-hidden className="mr-2">{r.icon}</span>{r.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{r.body}</p>
            <p className="mt-3 text-[12px] font-semibold text-[#1a4b8e] underline">{c.open}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {c.roadmap.map((rd) => (
          <div key={rd.title} className={`${cardCls} p-4`}>
            <h3 className="text-[13px] font-bold text-[#1a4b8e]"><span aria-hidden className="mr-1.5">{rd.icon}</span>{rd.title}</h3>
            <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600">{rd.body}</p>
            <p className={`mt-2 text-[11px] font-bold ${rd.ok ? "text-green-700" : "text-amber-700"}`}>{rd.status}</p>
          </div>
        ))}
      </div>

      {/* Latest updates strip */}
      <section className={cardCls + " mt-6 p-5"} aria-label="Latest updates">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#1a4b8e]">{c.updatesHead}</h3>
          <span className="text-[11px] text-slate-500">{c.upd.length}/{c.upd.length} · {c.updatesSub}</span>
        </div>
        <ul className="mt-3 space-y-2.5">
          {c.upd.map((u, i) => (
            <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px]">
              <span className="w-14 shrink-0 font-mono text-[11px] font-bold text-[#8a6d00]">{u.date}</span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${u.tag === ("Latest") || u.tag === "नवीनतम" ? "bg-green-50 text-green-700" : u.tag === "Security" || u.tag === "सुरक्षा" ? "bg-blue-50 text-[#1a4b8e]" : "bg-purple-50 text-purple-700"}`}>{u.tag}</span>
              <span className="text-slate-700">{u.text}</span>
            </li>
          ))}
        </ul>
      </section>

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
