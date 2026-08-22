"use client";
import { createContext, useContext, useEffect, useState } from "react";
export type Lang = "en" | "hi";
const dict = {
  en: {
    navHome: "Home",
    navPortal: "Simulated Portal",
    navFixer: "Agent Console",
    navDemo: "Demo Theater",
    navStory: "Story",
    navTerms: "Terms",
    headerTitle: "FIXER.OS — Public Service Accountability Layer",
    headerSub: "Independent Prototype · Build What Moves India",
    simOnly: "SIMULATION ONLY — independent hackathon prototype · not affiliated with any Government body · all data synthetic",
    heroEyebrow: "Everyone built compliance copilots for citizens.",
    heroTitle: "Nobody audits the state back.",
    heroDesc: "The state digitized forms, never accountability. Every public-service portal ends with “now track it yourself.” FIXER.OS is the missing counterparty: it verifies the government’s claims against an independent, tamper-evident case ledger, predicts rejections before they happen, proves rule deadlocks mathematically, and escalates with legally-cited teeth.",
    evalTitle: "Evaluate like a judge",
    evalDesc: "Login to the simulated portal (UAN 100000000000 · password demo1234) or go straight to the console.",
    termsTitle: "Terms & Conditions — Synthetic Demo (Latest 2026)",
    termsIntro: "These terms are written from live RBI, CPA, DPDP, GIGW sources as of Aug 2026. All data is synthetic; no real government system is touched.",
    storyTitle: "Why FIXER.OS? — A friend’s family waited 6 months for their own PF",
    storySub: "Motivation, novelty, and where AI actually helps (and where it doesn’t).",
    portalLogin: "Member Login — Universal Account Number (UAN)",
    portalCaptcha: "Enter Captcha Characters:",
    portalOtp: "OTP Verification — Registered Mobile (synthetic)",
    claimForm: "Form-31 : Advance from Provident Fund Account (Member Self-Service)",
  },
  hi: {
    navHome: "मुखपृष्ठ",
    navPortal: "नकली पोर्टल",
    navFixer: "एजेंट कंसोल",
    navDemo: "डेमो थिएटर",
    navStory: "कहानी",
    navTerms: "नियम",
    headerTitle: "FIXER.OS — जन सेवा जवाबदेही परत",
    headerSub: "स्वतंत्र प्रोटोटाइप · Build What Moves India",
    simOnly: "केवल सिमुलेशन — स्वतंत्र हैकाथॉन प्रोटोटाइप · किसी सरकारी निकाय से संबद्ध नहीं · सभी डेटा कृत्रिम",
    heroEyebrow: "सबने नागरिकों के लिए अनुपालन सहायक बनाए।",
    heroTitle: "राज्य की जाँच किसी ने नहीं की।",
    heroDesc: "राज्य ने फॉर्म डिजिटल किए, जवाबदेही नहीं। हर सरकारी पोर्टल “अब खुद ट्रैक करो” पर खत्म होता है। FIXER.OS लापता प्रतिपक्ष है: यह सरकार के दावों को स्वतंत्र, छेड़छाड़-रहित केस लेजर से जाँचता है, अस्वीकृतियों की भविष्यवाणी करता है, नियम-गतिरोधों को गणितीय रूप से सिद्ध करता है और कानूनी हवाले से एस्केलेट करता है।",
    evalTitle: "जज की तरह मूल्यांकन करें",
    evalDesc: "नकली पोर्टल में लॉगिन करें (UAN 100000000000 · पासवर्ड demo1234) या सीधे कंसोल पर जाएं।",
    termsTitle: "नियम व शर्तें — कृत्रिम डेमो (नवीनतम 2026)",
    termsIntro: "ये शर्तें अगस्त 2026 तक के लाइव RBI, CPA, DPDP, GIGW स्रोतों से लिखी गई हैं। सभी डेटा कृत्रिम है; कोई वास्तविक सरकारी सिस्टम नहीं छुआ गया।",
    storyTitle: "FIXER.OS क्यों? — दोस्त के परिवार को 6 महीने अपना PF नहीं मिला",
    storySub: "प्रेरणा, नवीनता, और AI वास्तव में कहाँ मदद करता है (और कहाँ नहीं)।",
    portalLogin: "सदस्य लॉगिन — सार्वभौमिक खाता संख्या (UAN)",
    portalCaptcha: "कैप्चा अक्षर दर्ज करें:",
    portalOtp: "OTP सत्यापन — पंजीकृत मोबाइल (कृत्रिम)",
    claimForm: "फॉर्म-31 : भविष्य निधि खाते से अग्रिम (सदस्य स्व-सेवा)",
  },
} as const;
export const t = (lang: Lang, key: keyof typeof dict.en) => dict[lang][key] || dict.en[key];

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const saved = (localStorage.getItem("fixer-lang") as Lang) || "en";
      setLangState(saved);
      document.documentElement.lang = saved;
      const savedFont = localStorage.getItem("fixer-font") || "100";
      document.documentElement.style.fontSize = savedFont + "%";
    } catch {}
  }, []);
  const setLang = (l: Lang) => {
    try {
      localStorage.setItem("fixer-lang", l);
      setLangState(l);
      document.documentElement.lang = l;
    } catch {}
  };
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}
export const useLang = () => useContext(LangContext);
export const getLang = (): Lang => {
  if (typeof window === "undefined") return "en";
  try { return (localStorage.getItem("fixer-lang") as Lang) || "en"; } catch { return "en"; }
};
