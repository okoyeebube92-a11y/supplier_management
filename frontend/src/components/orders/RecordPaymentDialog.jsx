import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPayment } from "../../api/orders";
import { formatRmb } from "../../utils/formatters";

const positiveDecimalPattern = /^\d+(?:\.\d+)?$/;

function getTodayForDateInput() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getServerMessage(error) {
  if (error.status === 400) {
    if (error.details?.length) return error.details.join(" ");
    if (error.message === "Payment exceeds the outstanding order balance.") return error.message;
    return "Check the payment details and try again.";
  }
  if (error.status === 404) return "This order is no longer available.";
  if (error.status >= 500) return "The payment service is temporarily unavailable. Please try again.";
  return "Unable to reach the payment service. Check your connection and try again.";
}

export default function RecordPaymentDialog({ orderId, outstandingBalance, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(getTodayForDateInput);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const amountInputRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    amountInputRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, submitting]);

  const submitPayment = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const amountValue = amount.trim();
    const nextErrors = {};
    if (!amountValue) {
      nextErrors.amount = "Amount is required.";
    } else if (!positiveDecimalPattern.test(amountValue) || /^0+(?:\.0+)?$/.test(amountValue)) {
      nextErrors.amount = "Enter a positive decimal amount.";
    }
    if (!paymentDate) nextErrors.paymentDate = "Payment date is required.";
    setErrors(nextErrors);
    setServerError("");
    if (Object.keys(nextErrors).length > 0) return;

    const paymentData = { amount: amountValue, paymentDate };
    if (reference.trim()) paymentData.reference = reference.trim();
    if (notes.trim()) paymentData.notes = notes.trim();

    setSubmitting(true);
    try {
      await createPayment(orderId, paymentData);
      onSuccess();
    } catch (error) {
      setServerError(getServerMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/55 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="record-payment-title" aria-describedby="record-payment-description" className="my-auto w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Order payment</p>
            <h2 id="record-payment-title" className="mt-1 text-xl font-semibold text-slate-950">Record Payment</h2>
            <p id="record-payment-description" className="mt-1 text-sm text-slate-500">Record an RMB payment against this order.</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close payment form" className="rounded-md p-2 text-slate-400 outline-none hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed">
            <X aria-hidden="true" size={19} />
          </button>
        </div>

        <form onSubmit={submitPayment} noValidate className="space-y-5 px-6 py-5">
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Outstanding Balance</p>
            <p className="mt-1 text-lg font-semibold text-slate-950">{formatRmb(outstandingBalance)}</p>
          </div>

          {serverError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

          <div>
            <label htmlFor="payment-amount" className="text-sm font-semibold text-slate-800">Amount</label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">¥</span>
              <input ref={amountInputRef} id="payment-amount" name="amount" type="text" inputMode="decimal" autoComplete="off" value={amount} onChange={(event) => setAmount(event.target.value)} aria-invalid={Boolean(errors.amount)} aria-describedby={errors.amount ? "payment-amount-error" : undefined} className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            {errors.amount && <p id="payment-amount-error" className="mt-1.5 text-sm text-red-600">{errors.amount}</p>}
          </div>

          <div>
            <label htmlFor="payment-date" className="text-sm font-semibold text-slate-800">Payment Date</label>
            <input id="payment-date" name="paymentDate" type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} aria-invalid={Boolean(errors.paymentDate)} aria-describedby={errors.paymentDate ? "payment-date-error" : undefined} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            {errors.paymentDate && <p id="payment-date-error" className="mt-1.5 text-sm text-red-600">{errors.paymentDate}</p>}
          </div>

          <div>
            <label htmlFor="payment-reference" className="text-sm font-semibold text-slate-800">Reference <span className="font-normal text-slate-400">(optional)</span></label>
            <input id="payment-reference" name="reference" type="text" value={reference} onChange={(event) => setReference(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div>
            <label htmlFor="payment-notes" className="text-sm font-semibold text-slate-800">Notes <span className="font-normal text-slate-400">(optional)</span></label>
            <textarea id="payment-notes" name="notes" rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300">
              {submitting ? "Recording…" : "Record Payment"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
