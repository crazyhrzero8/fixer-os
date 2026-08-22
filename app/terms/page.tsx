"use client";

import { GovShell, cardCls } from "../govshell";
import { useLang } from "@/lib/i18n";

const T = {
  en: {
    eyebrow: "Terms & Conditions — Synthetic Demo · Latest as of 22 Aug 2026",
    title: "You are using a safe simulation, not the real government site.",
    intro: "All data is synthetic (A. Kumar XXXX-XXXX-1234, UAN 100000000000). No real Aadhaar, PAN, OTP, or money is used. No live EPFO/IRCTC system is touched — judges test only the consumer journey.",
    s1h: "1. RBI — Your money, your deadline (Monetary Rule)",
    s1b: "RBI circular DPSS.CO.PD No.629/02.01.014/2019-20 dated 20 Sep 2019 (effective 15 Oct 2019, unchanged through Aug 2026): if your account is debited but the merchant gets no confirmation, the bank must auto-reverse within T+5 calendar days and pay ₹100/day beyond that suo moto — without your complaint (para 5). Denial goes to RBI Integrated Ombudsman Scheme 2021 (para 6). This is the exact rule our SLA clock uses.",
    s2h: "2. EPFO — The 10-year pension rule (Service Rule)",
    s2b: "EPS 1995 para 12 + EPS 2026 Gazette (Jul 2026): with 10+ years of pensionable service you get monthly pension at 58 (reduced from 50); below 10 years you get Form-10C lump sum or a Scheme Certificate; under 6 months nothing is payable. Six months or more counts as one full year. Our RuleGuard proves the portal bug where raw service in [9.5,10) permits neither withdrawal nor pension.",
    s3h: "3. CPA 2019 — Deficiency of service (Legal teeth)",
    s3b: "Section 2(11) defines deficiency in service. EPFO has been held liable as a service provider — most recently Kangra Consumer Commission (20 Jul 2026) awarded shortfall plus interest and costs for wrongly rounding down service. Jurisdiction per 2021 Rules: District up to ₹50 lakh, State ₹50L–₹2Cr. Our escalation letter cites exactly this.",
    s4h: "4. DPDP Act 2023 — Your data, your rights",
    s4b: "Act of 11 Aug 2023 + Rules notified 13 Nov 2025, phased: Board now, consent managers by Nov 2026, full compliance by May 2027. Until then the IT Act governs. Our demo is synthetic-only, purpose-limited — DPDP-ready by design.",
    s5h: "5. GIGW 3.0 — How government sites must be built",
    s5b: "Government of India guidelines (Dec 2023): 115 checkpoints, WCAG 2.1 AA accessibility, bilingual content, mobile-first, safe-to-host audits. Only 31 of 957 portals passed the last published audit. FIXER.OS follows the same discipline: light theme, system fonts, keyboard focus rings, text scaling, Hindi toggle.",
    s6h: "6. Your consent — what checking the box means",
    s6items: [
      "You understand this is a simulation — no real money moves, no real grievance is filed.",
      "Your synthetic interactions stay in a per-process demo store and vanish on redeploy.",
      "Never enter real Aadhaar/PAN/OTP — invalid entries are rejected server-side.",
      "Rate limit 30/min; OTP lives 5 minutes server-side only.",
      "For real EPFO work, always use unifiedportal-mem.epfindia.gov.in."
    ],
    updated: "Last updated 22 Aug 2026. Primary sources: RBI circular DPSS.CO.PD No.629/02.01.014/2019-20 · EPS 1995/2026 · CPA 2019 §2(11) + Jurisdiction Rules 2021 · Kangra CC/297/2025 · DPDP Act/Rules · GIGW 3.0 guidelines.india.gov.in."
  },
  hi: {
    eyebrow: "नियम व शर्तें — कृत्रिम डेमो · नवीनतम 22 अगस्त 2026",
    title: "आप एक सुरक्षित सिमुलेशन चला रहे हैं, असली सरकारी साइट नहीं।",
    intro: "सारा डेटा कृत्रिम है (अ. कुमार XXXX-XXXX-1234, UAN 100000000000)। कोई असली आधार, पैन, OTP या पैसा प्रयोग नहीं होता। किसी जीवित EPFO/IRCTC सिस्टम को छुआ नहीं जाता — जज केवल नागरिक-यात्रा जाँचते हैं।",
    s1h: "1. RBI — आपका पैसा, आपकी समय-सीमा (मौद्रिक नियम)",
    s1b: "RBI परिपत्र DPSS.CO.PD No.629/02.01.014/2019-20 (20 सितंबर 2019, अगस्त 2026 तक अपरिवर्तित): खाते से पैसा कट गया पर दुकानदार तक पुष्टि नहीं पहुँची तो बैंक T+5 कैलेंडर दिनों में स्वतः वापस करेगा और उसके बाद ₹100 प्रति दिन स्वतः (suo moto) देगा — बिना शिकायत (पैरा 5)। इनकार पर RBI इंटीग्रेटेड लोकपाल योजना 2021 (पैरा 6)। हमारी SLA घड़ी यही नियम दिखाती है।",
    s2h: "2. EPFO — 10-वर्ष पेंशन नियम (सेवा नियम)",
    s2b: "EPS 1995 पैरा 12 + EPS 2026 राजपत्र (जुलाई 2026): 10+ वर्ष पेंशनयोग्य सेवा पर 58 की आयु में मासिक पेंशन (50 से कम पर घटी)। 10 वर्ष से कम पर फॉर्म-10C एकमुश्त निकासी या स्कीम-प्रमाणपत्र; 6 महीने से कम पर कुछ नहीं। 6 महीने या अधिक = पूरा एक वर्ष। हमारा RuleGuard यह पोर्टल-बग सिद्ध करता है जहाँ कच्ची सेवा [9.5,10) में न निकासी न पेंशन।",
    s3h: "3. CPA 2019 — सेवा में कमी (कानूनी दाँत)",
    s3b: "धारा 2(11) सेवा-दोष परिभाषित करती है। EPFO को सेवा-प्रदाता माना जा चुका है — हालिया कांगड़ा उपभोक्ता आयोग (20 जुलाई 2026) ने सेवा-वर्ष गलत घटाने पर कमी + ब्याज + व्यय दिलाए। क्षेत्राधिकार (2021 नियम): ज़िला ₹50 लाख तक, राज्य ₹50L–₹2Cr। हमारा एस्केलेशन पत्र यही उद्धृत करता है।",
    s4h: "4. DPDP अधिनियम 2023 — आपका डेटा, आपके अधिकार",
    s4b: "11 अगस्त 2023 का अधिनियम + 13 नवंबर 2025 के नियम, चरणबद्ध: बोर्ड अब, सहमति-प्रबंधक नवंबर 2026 तक, पूर्ण अनुपालन मई 2027 तक। तब तक IT अधिनियम लागू। हमारा डेमो पूर्णतः कृत्रिम, उद्देश्य-सीमित — DPDP-तैयार।",
    s5h: "5. GIGW 3.0 — सरकारी साइट कैसी होनी चाहिए",
    s5b: "भारत सरकार दिशानिर्देश (दिसंबर 2023): 115 जाँच-बिंदु, WCAG 2.1 AA सुगम्यता, द्विभाषी सामग्री, मोबाइल-फर्स्ट, सुरक्षा-ऑडिट। पिछले प्रकाशित ऑडिट में 957 में से केवल 31 पोर्टल पास हुए। FIXER.OS वही अनुशासन: हल्की थीम, सिस्टम फॉन्ट, कीबोर्ड फ़ोकस, टेक्स्ट स्केलिंग, हिन्दी टॉगल।",
    s6h: "6. आपकी सहमति — बॉक्स टिक करने का अर्थ",
    s6items: [
      "यह सिमुलेशन है — कोई असली भुगतान नहीं, कोई असली शिकायत दर्ज नहीं होती।",
      "कृत्रिम इंटरैक्शन प्रक्रिया-आधारित डेमो-स्टोर में रहते हैं, रीडिप्लॉय पर मिट जाते हैं।",
      "असली आधार/पैन/OTP कभी दर्ज न करें — ग़लत प्रविष्टि सर्वर पर अस्वीकृत होती है।",
      "दर 30/मिनट; OTP केवल सर्वर पर 5 मिनट जीवित।",
      "असली EPFO कार्य हेतु सदैव unifiedportal-mem.epfindia.gov.in ही उपयोग करें।"
    ],
    updated: "अंतिम अद्यतन 22 अगस्त 2026। प्राथमिक स्रोत: RBI परिपत्र DPSS.CO.PD No.629/02.01.014/2019-20 · EPS 1995/2026 · CPA 2019 §2(11) + क्षेत्राधिकार नियम 2021 · कांगड़ा CC/297/2025 · DPDP अधिनियम/नियम · GIGW 3.0 guidelines.india.gov.in।"
  }
} as const;

export default function Terms() {
  const { lang } = useLang();
  const t = T[lang === "hi" ? "hi" : "en"];
  return (
    <GovShell active="/terms">
      <div className={`${cardCls} p-6 sm:p-8`} lang={lang}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">{t.eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold text-[#1a4b8e]">{t.title}</h2>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-700">{t.intro}</p>

        <div className="mt-6 space-y-5 text-[13px] leading-relaxed text-slate-700">
          {([["s1h", "s1b"], ["s2h", "s2b"], ["s3h", "s3b"], ["s4h", "s4b"], ["s5h", "s5b"]] as const).map(([h, b]) => (
            <section key={h} className="rounded-sm border border-slate-200 bg-[#f8fafc] p-4">
              <h3 className="font-bold text-[#1a4b8e]">{t[h]}</h3>
              <p className="mt-1">{t[b]}</p>
            </section>
          ))}
          <section className="rounded-sm border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-900">{t.s6h}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {t.s6items.map((it, i) => <li key={i}>{it}</li>)}
            </ul>
            <p className="mt-3 text-[11px] text-slate-500">{t.updated}</p>
          </section>
        </div>
      </div>
    </GovShell>
  );
}
