"use client";

import Link from "next/link";
import { t, useLang, type Lang } from "@/lib/i18n";
import NavBot from "@/components/NavBot";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/portal", label: "Simulated Portal" },
  { href: "/fixer", label: "Agent Console" },
  { href: "/demo", label: "Demo Theater" }
];

export const btnPrimary =
  "inline-block cursor-pointer rounded-sm bg-[#1a4b8e] px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-[#123763] disabled:cursor-not-allowed disabled:opacity-50";
export const btnOutline =
  "inline-block cursor-pointer rounded-sm border border-[#1a4b8e] px-4 py-1.5 text-[13px] font-semibold text-[#1a4b8e] hover:bg-[#eef3f9] disabled:cursor-not-allowed disabled:opacity-50";
export const cardCls = "rounded-md border border-slate-200 bg-white shadow-sm";
export const pageWrap = "mx-auto w-full max-w-6xl px-4 sm:px-6";

export function GovShell({ active, children }: { active: string; children: React.ReactNode }) {
  const { lang, setLang } = useLang();
  const setFont = (d: number) => {
    try {
      const cur = parseInt(localStorage.getItem("fixer-font") || "100", 10);
      const nxt = Math.min(130, Math.max(85, cur + d));
      localStorage.setItem("fixer-font", String(nxt));
      document.documentElement.style.fontSize = nxt + "%";
    } catch {}
  };
  // Initialize font on mount
  if (typeof window !== "undefined") {
    try {
      const savedFont = localStorage.getItem("fixer-font") || "100";
      document.documentElement.style.fontSize = savedFont + "%";
    } catch {}
  }
  return (
    <div className="min-h-screen bg-[#f5f7fa] font-sans text-slate-900" lang={lang} suppressHydrationWarning>
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
      <div className="bg-[#fff8e6] px-4 py-1 text-center text-[11px] text-[#8a6d00]">
        {t(lang, "simOnly")} · Helpline (synthetic): <b>1800-425-0000</b> · <a href="mailto:tnhealthinsurance@example.com" className="underline">fixer-os@example.com</a>
      </div>

      <header className="border-b-2 border-[#1a4b8e] bg-white">
        <div className={`${pageWrap} flex flex-wrap items-center justify-between gap-3 py-3`}>
          <Link href="/" className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="h-11 w-11">
              <circle cx="32" cy="32" r="28" fill="#f0f4fa" stroke="#1a4b8e" stroke-width="3.5" />
              <path d="M 33 25 H 24 C 20.5 25 20.5 33 24 33 H 30" fill="none" stroke="#1a4b8e" stroke-width="5.5" stroke-linecap="round" />
              <path d="M 34 25 H 40 C 43.5 25 43.5 33 40 33 H 31" fill="none" stroke="#1a4b8e" stroke-width="5.5" stroke-linecap="round" />
              <line x1="31.5" y1="28.5" x2="32.5" y2="29.5" stroke="#f0f4fa" stroke-width="2" />
              <text x="32" y="49" font-family="Courier, monospace" font-size="7.5" font-weight="bold" fill="#1a4b8e" text-anchor="middle" letter-spacing="1">FIXER.OS</text>
            </svg>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">{t(lang, "headerSub")}</p>
              <h1 className="text-lg font-bold leading-tight text-[#1a4b8e]">{t(lang, "headerTitle")}</h1>
              {/* Hindi subtitle always visible (user: no Tamil) */}
              <p className="text-[12px] font-semibold text-slate-600" lang="hi">लोक सेवा जवाबदेही परत</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-[11px]">
            <button type="button" onClick={() => setLang("hi")} className={lang === "hi" ? "rounded-sm border border-[#1a4b8e] bg-[#1a4b8e] px-2 py-1 font-semibold text-white" : btnOutline} aria-pressed={lang === "hi"}>हिन्दी</button>
            <button type="button" onClick={() => setLang("en")} className={lang === "en" ? "rounded-sm border border-[#1a4b8e] bg-[#1a4b8e] px-2 py-1 font-semibold text-white" : btnOutline} aria-pressed={lang === "en"}>English</button>
            <span className="ml-1 hidden sm:inline" aria-hidden>|</span>
            <button type="button" onClick={() => setFont(10)} aria-label="Increase font size" className="rounded-sm border border-slate-300 bg-white px-1.5 py-1 hover:border-[#1a4b8e]">A⁺</button>
            <button type="button" onClick={() => setFont(-10)} aria-label="Decrease font size" className="rounded-sm border border-slate-300 bg-white px-1.5 py-1 hover:border-[#1a4b8e]">A⁻</button>
          </div>
        </div>
      </header>

      <nav className="bg-[#1a4b8e] text-white" aria-label="Main navigation">
        <ul className={`${pageWrap} flex flex-wrap px-2 text-[13px]`}>
          {(active === "/fixer"
            ? [{ href: "/", label: t(lang, "navHome") }]
            : [
                { href: "/", label: t(lang, "navHome") },
                { href: "/portal", label: t(lang, "navPortal") },
                { href: "/terms", label: lang === "hi" ? "नियम" : "Terms" },
              ]
          ).map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`inline-block px-3 py-2 hover:bg-[#123763] focus:outline-none focus:ring-2 focus:ring-white ${active === item.href ? "bg-[#123763] font-bold" : ""}`}
                aria-current={active === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main className={`${pageWrap} py-6`}>{children}</main>

      <footer className="mt-8 border-t border-slate-200 bg-white py-6">
        <div className={`${pageWrap} flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500`}>
          <span>{t(lang, "footBottom")}</span>
          <div className="flex gap-3">
            <Link href="/terms" className="underline hover:text-[#1a4b8e]">{lang === "hi" ? "नियम व शर्तें" : "Terms & Conditions"}</Link>
          </div>
        </div>
      </footer>
      <NavBot />
    </div>
  );
}
