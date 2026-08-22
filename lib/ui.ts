export const UI = {
  page: "min-h-screen bg-[#f5f7fa] px-4 py-6 text-slate-900 antialiased sm:px-6",
  wrap: "mx-auto max-w-6xl",
  headerRow: "flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6",
  eyebrow: "text-[11px] font-bold uppercase tracking-widest text-[#1a4b8e]",
  h1: "mt-1 text-2xl font-bold tracking-tight text-[#1a4b8e] sm:text-3xl",
  sub: "mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-600",
  card: "rounded-md border border-slate-300 bg-white p-5 shadow-sm",
  cardTitle: "text-[15px] font-bold text-slate-900",
  label: "text-[11px] font-bold uppercase tracking-widest text-slate-600",
  btnPrimary: "inline-block rounded-sm bg-[#1a4b8e] px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-[#123763] disabled:opacity-50",
  btnGhost: "inline-block rounded-sm border border-[#1a4b8e] px-4 py-1.5 text-[13px] font-semibold text-[#1a4b8e] hover:bg-[#eef3f9] disabled:opacity-50",
  input: "w-full rounded-sm border border-slate-300 bg-white px-3 py-1.5 text-[13px] text-slate-900 outline-none focus:border-[#1a4b8e]",
  tableHead: "border border-slate-300 bg-[#eef3f9] px-3 py-1.5 text-left text-[11px] font-bold uppercase tracking-wide text-[#1a4b8e]",
  tableCell: "border border-slate-300 bg-white px-3 py-1.5 text-[13px]",
  alertError: "mb-4 rounded-sm border-l-4 border-red-700 bg-red-50 p-3 text-[13px] text-red-900"
} as const;
