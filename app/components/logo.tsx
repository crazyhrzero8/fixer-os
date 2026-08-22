export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden="true">
        <rect width="64" height="64" rx="12" fill="#101828" />
        <path d="M32 8 L52 16 V32 C52 46 43 54 32 58 C21 54 12 46 12 32 V16 Z" fill="none" stroke="#22d3ee" strokeWidth="4" />
        <path d="M24 32 L30 38 L42 24" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compact && <span className="text-lg font-bold tracking-tight text-slate-100">FIXER<span className="text-cyan-400">.OS</span></span>}
    </span>
  );
}
