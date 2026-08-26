import { AlertCircle, PackageSearch, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export function OrderDetailLoading() {
  return (
    <div aria-live="polite" aria-busy="true" className="space-y-5">
      <span className="sr-only">Loading order details</span>
      <div className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white" />
      <div className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white" />
      <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}

export function OrderDetailFailure({ invalid = false, notFound = false, onRetry }) {
  let title = "We couldn’t load this order";
  let message = "Check that the order service is available, then try again.";
  if (invalid) {
    title = "Invalid order ID";
    message = "Use a valid positive order number.";
  } else if (notFound) {
    title = "Order not found";
    message = "This order does not exist or is no longer available.";
  }

  return (
    <div role={invalid || notFound ? undefined : "alert"} className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      {invalid || notFound ? <PackageSearch aria-hidden="true" className="mx-auto text-slate-300" size={38} /> : <AlertCircle aria-hidden="true" className="mx-auto text-red-500" size={38} />}
      <h2 className="mt-4 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
          <RefreshCw aria-hidden="true" size={16} /> Try again
        </button>
      ) : (
        <Link to="/suppliers" className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">Back to suppliers</Link>
      )}
    </div>
  );
}
