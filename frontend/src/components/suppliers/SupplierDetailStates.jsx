import { AlertCircle, Building2, PackageSearch, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export function DetailLoading({ label }) {
  return (
    <div aria-live="polite" aria-busy="true" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="sr-only">{label}</span>
      <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}
      </div>
    </div>
  );
}

export function DetailError({ title, message, onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-white px-6 py-10 text-center shadow-sm">
      <AlertCircle aria-hidden="true" className="mx-auto text-red-500" size={32} />
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{message}</p>
      <button type="button" onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
        <RefreshCw aria-hidden="true" size={16} /> Try again
      </button>
    </div>
  );
}

export function SupplierNotFound({ invalid = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <Building2 aria-hidden="true" className="mx-auto text-slate-300" size={38} />
      <h2 className="mt-4 text-xl font-semibold text-slate-900">{invalid ? "Invalid supplier ID" : "Supplier not found"}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {invalid ? "Use a valid positive supplier number." : "This supplier does not exist or is no longer available."}
      </p>
      <Link to="/suppliers" className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
        Back to suppliers
      </Link>
    </div>
  );
}

export function OrdersEmpty() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <PackageSearch aria-hidden="true" className="mx-auto text-slate-300" size={36} />
      <h3 className="mt-4 font-semibold text-slate-900">No orders yet</h3>
      <p className="mt-2 text-sm text-slate-500">This supplier does not have any recorded orders.</p>
    </div>
  );
}
