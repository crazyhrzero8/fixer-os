import Link from "next/link";

const routes = [
  {
    href: "/portal",
    title: "/portal — The Villain",
    body: "A mock EPFO-style portal that faithfully replays documented real-world failures: false rejections, invalid grievance IDs, lockouts."
  },
  {
    href: "/fixer",
    title: "/fixer — The Agent",
    body: "The case-owner console: hash-chained evidence ledger, false-rejection detection, appeal drafting, SLA clock ticking in rupees."
  },
  {
    href: "/demo",
    title: "/demo — The Theater",
    body: "Split screen. Left: a citizen alone, stuck forever. Right: the same citizen with FIXER.OS. Watch resolution happen."
  }
];

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <p className="mb-3 text-sm font-medium tracking-widest text-amber-400 uppercase">
        Build What Moves India — independent prototype · synthetic data only
      </p>
      <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
        Everyone built compliance copilots for citizens.
        <span className="block text-amber-400">Nobody audits the state back.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-gray-400">
        The state digitized forms, never accountability. Every government system ends with
        &ldquo;now track it yourself.&rdquo; FIXER.OS is the missing counterparty: it verifies the
        state&rsquo;s claims against an independent, tamper-evident case ledger, proves rule
        deadlocks mathematically, and escalates with teeth.
      </p>
      <div className="mt-8 grid max-w-2xl grid-cols-1 gap-2 text-[13px] sm:grid-cols-3">
        {[["763 Mn/day", "UPI transactions — India's rails already work"], ["₹100/day", "RBI-mandated compensation citizens never claim"], ["31 / 957", "govt portals that passed their own GIGW audit"]].map(([stat, label]) => (
          <div key={stat} className="rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-2">
            <p className="font-bold text-amber-400">{stat}</p>
            <p className="text-xs leading-snug text-gray-400">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {routes.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="group rounded-xl border border-gray-800 bg-gray-900/40 p-6 transition hover:border-amber-500/60 hover:bg-gray-900"
          >
            <h2 className="font-semibold text-gray-100 group-hover:text-amber-400">{r.title}</h2>
            <p className="mt-3 text-sm text-gray-400">{r.body}</p>
          </Link>
        ))}
      </div>
      <footer className="mt-16 border-t border-gray-800 pt-6 text-xs text-gray-500">
        Not affiliated with EPFO or any government body. No live systems touched. No real personal
        data used. Built for the Build What Moves India hackathon.
      </footer>
    </main>
  );
}
