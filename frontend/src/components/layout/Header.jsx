import { Search } from "lucide-react";

export default function Header({ title }) {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur lg:px-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Operations</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
      </div>
      <div className="relative hidden w-full max-w-xs sm:block">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          aria-label="Global search, coming soon"
          readOnly
          title="Global search is not available yet"
          placeholder="Search workspace"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-600 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>
    </header>
  );
}
