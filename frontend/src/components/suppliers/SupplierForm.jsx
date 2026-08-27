import { useRef, useState } from "react";
import { Link } from "react-router-dom";

function getServerMessage(error) {
  if (error.status === 400) {
    if (error.details?.length) return error.details.join(" ");
    return "Check the supplier details and try again.";
  }
  if (error.status === 404) return "This supplier is no longer available.";
  if (error.status >= 500) return "The supplier service is temporarily unavailable. Please try again.";
  return "Unable to reach the supplier service. Check your connection and try again.";
}

export default function SupplierForm({ mode, initialValues = {}, cancelTo, onSubmit }) {
  const [name, setName] = useState(initialValues.name || "");
  const [location, setLocation] = useState(initialValues.location || "");
  const [mobileNumber, setMobileNumber] = useState(initialValues.mobileNumber || "");
  const [nameError, setNameError] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const creating = mode === "create";

  const submitSupplier = async (event) => {
    event.preventDefault();
    if (submissionLock.current) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Supplier name is required.");
      setServerError("");
      return;
    }

    setNameError("");
    setServerError("");
    const supplierData = { name: trimmedName };
    if (!creating || location.trim()) supplierData.location = location.trim();
    if (!creating || mobileNumber.trim()) supplierData.mobileNumber = mobileNumber.trim();

    submissionLock.current = true;
    setSubmitting(true);
    try {
      await onSubmit(supplierData);
    } catch (error) {
      submissionLock.current = false;
      setServerError(getServerMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitSupplier} noValidate className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      {serverError && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="supplier-name-input" className="text-sm font-semibold text-slate-800">Name</label>
          <input id="supplier-name-input" type="text" value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "supplier-name-error" : undefined} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          {nameError && <p id="supplier-name-error" className="mt-1.5 text-sm text-red-600">{nameError}</p>}
        </div>
        <div>
          <label htmlFor="supplier-location-input" className="text-sm font-semibold text-slate-800">Location <span className="font-normal text-slate-400">(optional)</span></label>
          <input id="supplier-location-input" type="text" value={location} onChange={(event) => setLocation(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>
        <div>
          <label htmlFor="supplier-mobile-input" className="text-sm font-semibold text-slate-800">Mobile Number <span className="font-normal text-slate-400">(optional)</span></label>
          <input id="supplier-mobile-input" type="tel" value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>
      </div>
      <div className="mt-7 flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-6 sm:flex-row">
        <Link to={cancelTo} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">Cancel</Link>
        <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300">{submitting ? "Saving…" : creating ? "Create Supplier" : "Save Changes"}</button>
      </div>
    </form>
  );
}
