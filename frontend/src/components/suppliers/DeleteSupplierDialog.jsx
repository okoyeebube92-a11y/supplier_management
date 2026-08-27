import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function DeleteSupplierDialog({ supplier, error, deleting, onCancel, onConfirm }) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    cancelButtonRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !deleting) onCancel();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [deleting, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 p-4" role="presentation">
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-supplier-title" aria-describedby="delete-supplier-description" className="my-auto w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-lg bg-red-50 p-2 text-red-600"><AlertTriangle aria-hidden="true" size={20} /></span>
            <div>
              <h2 id="delete-supplier-title" className="text-lg font-semibold text-slate-950">Delete {supplier.name}?</h2>
              <p id="delete-supplier-description" className="mt-1 text-sm text-slate-500">This action cannot be undone.</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} disabled={deleting} aria-label="Close delete confirmation" className="rounded-md p-2 text-slate-400 outline-none hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed"><X aria-hidden="true" size={18} /></button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-slate-600">The supplier will be permanently removed. Suppliers with existing orders are protected and cannot be deleted.</p>
          {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button ref={cancelButtonRef} type="button" onClick={onCancel} disabled={deleting} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
            <button type="button" onClick={onConfirm} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-red-300">{deleting ? "Deleting…" : "Delete Supplier"}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
