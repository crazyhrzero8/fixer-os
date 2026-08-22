import Link from "next/link";

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
export const cardCls = "rounded-md border border-slate-300 bg-white shadow-sm";
export const pageWrap = "mx-auto w-full max-w-6xl px-4 sm:px-6";

export function GovShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f7fa] font-sans text-slate-900">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
      <div className="bg-[#fff8e6] px-4 py-1 text-center text-[11px] text-[#8a6d00]">
        SIMULATION ONLY — independent hackathon prototype · not affiliated with any Government body · all data synthetic
      </div>

      <header className="border-b-2 border-[#1a4b8e] bg-white">
        <div className={`${pageWrap} flex flex-wrap items-center justify-between gap-3 py-3`}>
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#1a4b8e] bg-[#f0f4fa] text-[9px] leading-tight text-[#1a4b8e]">
              FIXER
              <br />
              .OS
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Independent Prototype · Build What Moves India</p>
              <h1 className="text-lg font-bold text-[#1a4b8e]">FIXER.OS — Public Service Accountability Layer</h1>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-[11px]">
            <button type="button" className={btnOutline}>हिन्दी</button>
            <button type="button" className="rounded-sm border border-[#1a4b8e] bg-[#1a4b8e] px-2 py-1 font-semibold text-white">English</button>
            <span className="ml-1 hidden sm:inline">| A⁻ A A⁺</span>
          </div>
        </div>
      </header>

      <nav className="bg-[#1a4b8e] text-white">
        <ul className={`${pageWrap} flex flex-wrap px-2 text-[13px]`}>
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`inline-block px-3 py-2 hover:bg-[#123763] ${active === item.href ? "bg-[#123763] font-bold" : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main className={`${pageWrap} py-6`}>{children}</main>

      <footer className="mt-8 border-t-4 border-[#FF9933] bg-white">
        <div className={`${pageWrap} grid grid-cols-2 gap-6 py-6 text-[12px] text-slate-600 sm:grid-cols-4`}>
          {[
            ["Product", ["Agent Console", "Simulated Portal", "Demo Theater"]],
            ["Evidence", ["Hash-Chained Ledger", "RuleGuard Proofs", "Pre-flight Checks"]],
            ["Legal Basis", ["RBI TAT Circular 2019", "CPA 2019 Precedents", "DPDP-Aware Design"]],
            ["About", ["Research Dossier", "Codex Build Log", "Honesty Disclosures"]]
          ].map(([title, items]) => (
            <div key={title as string}>
              <p className="mb-2 font-bold text-[#1a4b8e]">{title as string}</p>
              <ul className="space-y-1">
                {(items as string[]).map((it) => (
                  <li key={it}>» {it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={`${pageWrap} border-t border-slate-200 py-3 text-center text-[11px] text-slate-500`}>
          FIXER.OS · Independent prototype for the Build What Moves India hackathon · Not affiliated with EPFO, IRCTC or any
          Government body · No live systems touched · Synthetic data only
        </div>
      </footer>
    </div>
  );
}
