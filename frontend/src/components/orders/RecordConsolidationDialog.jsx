import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createConsolidation } from "../../api/orders";

const positiveIntegerPattern = /^[1-9]\d*$/;

function getTodayForDateInput() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getServerMessage(error) {
  if (error.status === 400) {
    if (error.message === "Consolidation quantity exceeds the remaining ordered quantity.") return error.message;
    if (error.details?.length) return error.details.join(" ");
    return "Check the consolidation details and try again.";
  }
  if (error.status === 404) return "This order item is no longer available for this order.";
  if (error.status >= 500) return "The consolidation service is temporarily unavailable. Please try again.";
  return "Unable to reach the consolidation service. Check your connection and try again.";
}

export default function RecordConsolidationDialog({ orderId, item, onClose, onSuccess }) {
  const remainingQuantity = item.quantity - item.consolidatedQuantity;
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [consolidatedAt, setConsolidatedAt] = useState(getTodayForDateInput);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const quantityInputRef = useRef(null);
  const submissionLockRef = useRef(false);

  useEffect(() => {
    const previousFocus = document.activeElement;
    quantityInputRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !submissionLockRef.current) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const submitConsolidation = async (event) => {
    event.preventDefault();
    if (submissionLockRef.current) return;

    const quantityValue = quantity.trim();
    const locationValue = location.trim();
    const nextErrors = {};
    if (!quantityValue) {
      nextErrors.quantity = "Quantity is required.";
    } else if (!positiveIntegerPattern.test(quantityValue)) {
      nextErrors.quantity = "Enter a positive whole-number quantity.";
    } else if (Number(quantityValue) > remainingQuantity) {
      nextErrors.quantity = `Quantity cannot exceed the remaining ${remainingQuantity} ${item.unit}.`;
    }
    if (!locationValue) nextErrors.location = "Location is required.";
    if (!consolidatedAt) nextErrors.consolidatedAt = "Consolidation date is required.";
    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length > 0) return;

    const consolidationData = {
      quantity: Number(quantityValue),
      location: locationValue,
      consolidatedAt,
    };
    if (notes.trim()) consolidationData.notes = notes.trim();

    submissionLockRef.current = true;
    setSubmitting(true);
    try {
      await createConsolidation(orderId, item.id, consolidationData);
      onSuccess();
    } catch (error) {
      submissionLockRef.current = false;
      setServerError(getServerMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="record-consolidation-title" aria-describedby="record-consolidation-description" className="my-auto w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Item consolidation</p>
            <h2 id="record-consolidation-title" className="mt-1 text-xl font-semibold text-slate-950">Record Consolidation</h2>
            <p id="record-consolidation-description" className="mt-1 text-sm text-slate-500">Add a consolidation batch for {item.modelNumber}.</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close consolidation form" className="rounded-md p-2 text-slate-400 outline-none hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed">
            <X aria-hidden="true" size={19} />
          </button>
        </div>

        <form onSubmit={submitConsolidation} noValidate className="space-y-5 px-6 py-5">
          <dl className="grid grid-cols-3 overflow-hidden rounded-lg border border-indigo-100 bg-indigo-50 text-center">
            <div className="border-r border-indigo-100 px-2 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Ordered</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{item.quantity} {item.unit}</dd>
            </div>
            <div className="border-r border-indigo-100 px-2 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Consolidated</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{item.consolidatedQuantity} {item.unit}</dd>
            </div>
            <div className="px-2 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Remaining</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-950">{remainingQuantity} {item.unit}</dd>
            </div>
          </dl>

          {serverError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

          <div>
            <label htmlFor="consolidation-quantity" className="text-sm font-semibold text-slate-800">Quantity</label>
            <input ref={quantityInputRef} id="consolidation-quantity" name="quantity" type="text" inputMode="numeric" autoComplete="off" value={quantity} onChange={(event) => setQuantity(event.target.value)} aria-invalid={Boolean(errors.quantity)} aria-describedby={errors.quantity ? "consolidation-quantity-error" : undefined} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            {errors.quantity && <p id="consolidation-quantity-error" className="mt-1.5 text-sm text-red-600">{errors.quantity}</p>}
          </div>

          <div>
            <label htmlFor="consolidation-location" className="text-sm font-semibold text-slate-800">Location</label>
            <input id="consolidation-location" name="location" type="text" value={location} onChange={(event) => setLocation(event.target.value)} aria-invalid={Boolean(errors.location)} aria-describedby={errors.location ? "consolidation-location-error" : undefined} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            {errors.location && <p id="consolidation-location-error" className="mt-1.5 text-sm text-red-600">{errors.location}</p>}
          </div>

          <div>
            <label htmlFor="consolidation-date" className="text-sm font-semibold text-slate-800">Consolidation Date</label>
            <input id="consolidation-date" name="consolidatedAt" type="date" value={consolidatedAt} onChange={(event) => setConsolidatedAt(event.target.value)} aria-invalid={Boolean(errors.consolidatedAt)} aria-describedby={errors.consolidatedAt ? "consolidation-date-error" : undefined} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            {errors.consolidatedAt && <p id="consolidation-date-error" className="mt-1.5 text-sm text-red-600">{errors.consolidatedAt}</p>}
          </div>

          <div>
            <label htmlFor="consolidation-notes" className="text-sm font-semibold text-slate-800">Notes <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea id="consolidation-notes" name="notes" rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300">
              {submitting ? "Recording…" : "Record Consolidation"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
