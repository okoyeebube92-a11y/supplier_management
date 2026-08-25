import { AlertCircle, Building2, RefreshCw } from "lucide-react";

export function SupplierLoading() {
  return (
    <div aria-live="polite" aria-busy="true" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <span className="sr-only">Loading suppliers</span>
      <div className="border-b border-slate-200 px-6 py-5"><div className="h-4 w-40 animate-pulse rounded bg-slate-200" /></div>
      <div className="space-y-1 p-3">
        {[1, 2, 3].map((row) => (
          <div key={row} className="grid grid-cols-4 gap-6 px-3 py-5">
            <div className="h-10 animate-pulse rounded bg-slate-100" />
            <div className="h-5 animate-pulse rounded bg-slate-100" />
            <div className="h-5 animate-pulse rounded bg-slate-100" />
            <div className="h-5 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SupplierEmpty() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <Building2 aria-hidden="true" className="mx-auto text-slate-300" size={36} />
      <h3 className="mt-4 font-semibold text-slate-900">No suppliers yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Supplier records will appear here once they have been added through the API.</p>
    </div>
  );
}

export function SupplierError({ onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-white px-6 py-12 text-center shadow-sm">
      <AlertCircle aria-hidden="true" className="mx-auto text-red-500" size={36} />
      <h3 className="mt-4 font-semibold text-slate-900">We couldn’t load suppliers</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Check that the supplier service is available, then try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        <RefreshCw aria-hidden="true" size={16} /> Try again
      </button>
    </div>
  );
}
