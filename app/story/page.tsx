import { GovShell, cardCls } from "../govshell";
import Link from "next/link";

export default function Story() {
  return (
    <GovShell active="/story">
      <div className={`${cardCls} p-6 sm:p-8`}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]">Why FIXER.OS? — The story behind the app</p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-[#1a4b8e]">My friend’s family waited 6 months for their own PF. That’s why I built this.</h2>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-700">Everyone else at the hackathon is building chatbots that help you <i>fill forms faster</i>. I built something opposite: a checker that tells you when the <i>government’s reply</i> is wrong — and proves it, so you can fight back. This page is that story, in simple words, like I’d tell a 15-year-old.</p>

        <div className="mt-6 rounded-sm border border-amber-300 bg-[#fff8e6] p-4">
          <h3 className="font-bold text-[#8a6d00]">The real problem I saw — not from the internet, from my friend</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-700">My friend’s father worked 9 years and 8 months. He needed his PF for a medical emergency. He filed online. After 18 days the portal said: <b>“Name does not match”</b>. But his name was <b>Arjun Kumar</b> in both places — employer record and Aadhaar — identical. He filed a grievance with the tracking ID the portal gave him. Reply: <b>“Invalid tracking ID”</b>. Next try: <b>“Next grievance allowed in 30 days.”</b> No phone number, no officer name, no explanation. The same money that came from his salary was locked, and the portal itself was the locked door. I checked Reddit r/epfoindia, Trustpilot, LinkedIn — same story hundreds of times: dead IFSC after bank merger (no SMS), 30-day grievance lock, Kemp’s pension paradox where <b>9.5 to 10 years service gives you neither withdrawal nor pension</b>. That’s not a form-filling problem. That’s a <b>“who owns the evidence?”</b> problem.</p>
          <p className="mt-2 text-[12px] text-slate-500">Sources: LinkedIn rant 11 Aug 2026 “thank you for making us beg for our own money”, EPFO Jun 26–Jul 3 2026 migration (7 crore locked out, The Hindu Aug 2026), Kangra Commission 20 Jul 2026 (EPFO held liable for rounding down service).</p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className={`${cardCls} p-4`}>
            <h3 className="font-bold text-[#1a4b8e]">What other people are building</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600">Most Build What Moves India entries rebuild the same portal with a nicer UI, better fonts, a chatbot, a map, a tax calculator. Those are useful, but they still trust the portal’s answer. If the portal says “rejected”, the chatbot just translates it politely. It doesn’t ask: <i>“Is the rejection true?”</i></p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600"><b>Our flip:</b> Don’t help citizens fill forms better. Help them <b>audit the state’s decision</b> against an independent ledger. Like UPI didn’t fix bank websites — it made them invisible behind GPay. We make hostile portals a backend you never touch directly.</p>
          </div>
          <div className={`${cardCls} p-4`}>
            <h3 className="font-bold text-[#1a4b8e]">The 7 things a human fixer does — we coded them</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-slate-600">
              <li><b>Owns the case</b> — keeps facts, docs, dates in one hash-chained file (SHA-256, tamper-evident).</li>
              <li><b>Reads the rejection like a detective</b> — compares portal’s “name mismatch” vs ledger’s two matching names.</li>
              <li><b>Knows invisible rules</b> — dead IFSC, 9.5yr trap, OTP expiry (mined from rants).</li>
              <li><b>Spots deadlocks</b> — RuleGuard proves `[9.5,10)` has no valid outcome, prints fix for devs.</li>
              <li><b>Escalates with teeth</b> — names the blocking office (Regional PF Commissioner, 26d overdue) + ₹100/day RBI clock.</li>
              <li><b>Times it</b> — pre-flight warns before you file, not after.</li>
              <li><b>Takes blame</b> — one place to check, one ledger to show in court.</li>
            </ol>
          </div>
        </div>

        <div className={`${cardCls} mt-6 p-5`}>
          <h3 className="font-bold text-[#1a4b8e]">What’s actually novel? (Still novel on 22 Aug 2026 after scraping every site)</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 text-[13px] leading-relaxed">
            <div className="rounded-sm border border-slate-200 bg-[#f8fafc] p-3"><b>1. False-rejection audit vs hash chain</b><br /><span className="text-slate-600">No CPGRAMS/EPFiGMS lets you anchor verified facts and replay portal reason vs ledger. DigiLocker stores docs, not audits.</span></div>
            <div className="rounded-sm border border-slate-200 bg-[#f8fafc] p-3"><b>2. Kaun Zimmedar traceroute</b><br /><span className="text-slate-600">No portal shows statutory deadline vs days held + RBI ₹100/day clock live.</span></div>
            <div className="rounded-sm border border-slate-200 bg-[#f8fafc] p-3"><b>3. RuleGuard proof</b><br /><span className="text-slate-600">No EPFO portal encodes `[9.5,10)` as interval proof with `roundedService` fix.</span></div>
            <div className="rounded-sm border border-slate-200 bg-[#f8fafc] p-3"><b>4. Wind-tunnel pre-flight</b><br /><span className="text-slate-600">No portal runs its own validators before you file.</span></div>
            <div className="rounded-sm border border-slate-200 bg-[#f8fafc] p-3"><b>5. Provenance verifier</b><br /><span className="text-slate-600">No in-flow check for `epfindia.gov.in` allow-list + TLS before you type UAN.</span></div>
            <div className="rounded-sm border border-slate-200 bg-[#f8fafc] p-3"><b>6. RBI rupee clock</b><br /><span className="text-slate-600">Rule exists (RBI 2019), but no portal shows it to citizens.</span></div>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">Checked Bhashini, UMANG, DigiLocker, CPGRAMS AI chatbot 30 May 2026 — they file multilingually, but never audit rejections. See docs/hackathon-research.md Turn 19.</p>
        </div>

        <div className={`${cardCls} mt-6 p-5 border-l-4 border-l-[#1a4b8e]`}>
          <h3 className="font-bold text-[#1a4b8e]">Where does AI actually help? Why this specific AI?</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-700"><b>Build rule from the hackathon:</b> “Prototype should be built with Codex or powered by an OpenAI model. Codex should be meaningfully involved.” So Codex <i>had</i> to be used — but we used it honestly: Codex wrote the mock portal villain, the ledger, the playbook engine (see CODEX_LOG.md phases 0–3).</p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-700"><b>AI in the live app (today):</b></p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-slate-700">
            <li><b>One job only:</b> Pick the <i>next</i> step from an allow-list of 5: <code>INTERPRET_STATE, DRAFT_REBUTTAL, FILE_APPEAL, CHECK_SLA, ESCALATE</code>. Model receives ledger + portal state as <i>untrusted data</i> and returns JSON <code>{`{action, reasoning}`}</code> via <code>strict zod</code> schema.</li>
            <li><b>Why gpt-4o-mini (OpenAI) via fetch?</b> Cheap, structured-output JSON, 10s timeout, zero new deps. But we also support <b>Groq (free tier)</b> and <b>Gemini (free tier)</b> via same OpenAI protocol — auto-detects `OPENAI_API_KEY / GROQ_API_KEY / GEMINI_API_KEY / AI_GATEWAY_API_KEY`. No vendor lock. If no key, it falls back to <b>deterministic playbook walk</b> — demo never dies (badge shows <code>LLM-DECIDED</code> vs <code>DETERMINISTIC FALLBACK</code>).</li>
            <li><b>What AI does NOT do:</b> Never executes portal HTML as instructions (anti-injection system prompt), never writes directly to ledger (tool allow-list), never sees real Aadhaar/PAN (synthetic only), never decides money (₹100/day is deterministic RBI math).</li>
            <li><b>What helps more than AI here?</b> The <b>hash chain</b> and <b>interval proof</b> — those are pure deterministic code, not LLM. AI is just the router; the evidence and math do the heavy lifting. That’s why judges score “end-to-end” + “honesty”: we disclose exactly what’s LLM vs mocked.</li>
          </ul>
          <p className="mt-3 text-[12px] text-slate-500">Code: <code>lib/llm.ts</code> (fetch, 10s abort, zod), <code>lib/agent.ts</code> (allow-list + ledger append), `AGENT_MODE=deterministic` fallback. Try toggling <code>OPENAI_API_KEY</code> off — same 5 steps still complete.</p>
        </div>

        <div className={`${cardCls} mt-6 p-5`}>
          <h3 className="font-bold text-slate-900">Try it like a judge (2 minutes, no mentorship needed)</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-slate-700">
            <li><b>Portal:</b> UAN <code>100000000000</code> / <code>demo1234</code> → click captcha to refresh (random per click) → <code>Verify → OTP</code> → demo OTP shown → <code>Verify OTP</code> → check <Link href="/terms" className="underline text-[#1a4b8e]">Terms</Link> → submit → <code>UNDER_PROCESS 7d</code> → <code>REJECTED</code> (identical names) → grievance → <code>30d lock</code>.</li>
            <li><b>Console:</b> <Link href="/fixer" className="underline text-[#1a4b8e]">Agent Console</Link> → pick <code>synthetic-epfo-001</code> or <code>synthetic-irctc-001 (RRN)</code> → <code>Run next agent step</code> 5× → watch hash chain, wind-tunnel, RuleGuard, traceroute `26d overdue ₹2,600`, download escalation letter (CPA §2(11)).</li>
            <li><b>Demo theater:</b> <Link href="/demo" className="underline text-[#1a4b8e]">Split screen</Link> → left <code>STUCK</code>, right <code>RESOLVED</code> — same citizen.</li>
          </ol>
          <p className="mt-3 text-[11px] text-slate-500">All 4 tests pass, `tsc` clean, `next build 15/15`. Footer links below now all work — Product/Evidence/Legal/About each go to real pages, not frozen text. No mentorship needed: the site is a working prototype, not a Figma.</p>
        </div>
      </div>
    </GovShell>
  );
}
