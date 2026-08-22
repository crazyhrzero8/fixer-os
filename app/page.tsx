import Link from "next/link";
import { GovShell, btnOutline, btnPrimary, cardCls, pageWrap } from "./govshell";

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
  return (
    <GovShell active="/">
      <section className={`${cardCls} mx-auto p-6 sm:p-8`}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">
          Everyone built compliance copilots for citizens.
        </p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-[#1a4b8e] sm:text-4xl">
          Nobody audits the state back.
        </h2>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-slate-700">
          The state digitized forms, never accountability. Every public-service portal ends with
          &ldquo;now track it yourself.&rdquo; FIXER.OS is the missing counterparty: it verifies the
          government&rsquo;s claims against an independent, tamper-evident case ledger, predicts
          rejections before they happen, proves rule deadlocks mathematically, and escalates with
          legally-cited teeth.
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
          <h3 className="font-bold text-slate-900">Evaluate like a judge</h3>
          <p className="mt-1 text-[13px] text-slate-600">
            Login to the simulated portal (UAN <b>100000000000</b> · password <b>demo1234</b>) or go straight to the console.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/portal" className={btnPrimary}>Enter portal</Link>
          <Link href="/fixer" className={btnOutline}>Open console</Link>
        </div>
      </section>
    </GovShell>
  );
}
