import { Trash2 } from "lucide-react";

export default function OrderItemFields({ index, item, errors, canRemove, onChange, onRemove }) {
  const fieldId = (field) => `order-item-${item.key}-${field}`;
  const describedBy = (field) => errors[field] ? `${fieldId(field)}-error` : undefined;

  return (
    <fieldset className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
      <legend className="px-1 text-base font-semibold text-slate-950">Item {index + 1}</legend>
      <div className="-mt-7 flex justify-end">
        <button type="button" onClick={onRemove} disabled={!canRemove} aria-label={`Remove item ${index + 1}`} className="inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-semibold text-red-600 outline-none hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent">
          <Trash2 aria-hidden="true" size={16} /> Remove
        </button>
      </div>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId("modelNumber")} className="text-sm font-semibold text-slate-800">Model Number</label>
          <input id={fieldId("modelNumber")} type="text" value={item.modelNumber} onChange={(event) => onChange("modelNumber", event.target.value)} aria-invalid={Boolean(errors.modelNumber)} aria-describedby={describedBy("modelNumber")} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          {errors.modelNumber && <p id={`${fieldId("modelNumber")}-error`} className="mt-1.5 text-sm text-red-600">{errors.modelNumber}</p>}
        </div>

        <div>
          <label htmlFor={fieldId("description")} className="text-sm font-semibold text-slate-800">Description <span className="font-normal text-slate-400">(optional)</span></label>
          <input id={fieldId("description")} type="text" value={item.description} onChange={(event) => onChange("description", event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        </div>

        <div>
          <label htmlFor={fieldId("quantity")} className="text-sm font-semibold text-slate-800">Quantity</label>
          <input id={fieldId("quantity")} type="text" inputMode="numeric" value={item.quantity} onChange={(event) => onChange("quantity", event.target.value)} aria-invalid={Boolean(errors.quantity)} aria-describedby={describedBy("quantity")} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          {errors.quantity && <p id={`${fieldId("quantity")}-error`} className="mt-1.5 text-sm text-red-600">{errors.quantity}</p>}
        </div>

        <div>
          <label htmlFor={fieldId("unit")} className="text-sm font-semibold text-slate-800">Unit</label>
          <input id={fieldId("unit")} type="text" value={item.unit} onChange={(event) => onChange("unit", event.target.value)} aria-invalid={Boolean(errors.unit)} aria-describedby={describedBy("unit")} placeholder="e.g. PCS or PAIRS" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          {errors.unit && <p id={`${fieldId("unit")}-error`} className="mt-1.5 text-sm text-red-600">{errors.unit}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={fieldId("unitPrice")} className="text-sm font-semibold text-slate-800">Unit Price</label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">¥</span>
            <input id={fieldId("unitPrice")} type="text" inputMode="decimal" value={item.unitPrice} onChange={(event) => onChange("unitPrice", event.target.value)} aria-invalid={Boolean(errors.unitPrice)} aria-describedby={describedBy("unitPrice")} className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </div>
          {errors.unitPrice && <p id={`${fieldId("unitPrice")}-error`} className="mt-1.5 text-sm text-red-600">{errors.unitPrice}</p>}
        </div>
      </div>
    </fieldset>
  );
}
