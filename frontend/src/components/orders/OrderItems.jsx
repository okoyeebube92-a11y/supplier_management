import { MapPin } from "lucide-react";
import { formatDate, formatRmb } from "../../utils/formatters";
import OrderStatusBadge from "./OrderStatusBadge";

function ConsolidationHistory({ records, unit }) {
  if (records.length === 0) {
    return <p className="rounded-lg border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">No consolidation records for this item.</p>;
  }

  return (
    <ol className="grid gap-3 lg:grid-cols-2">
      {records.map((record) => (
        <li key={record.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <p className="font-semibold text-slate-900">{record.quantity} {unit}</p>
            <time className="text-xs text-slate-500" dateTime={record.consolidatedAt}>{formatDate(record.consolidatedAt)}</time>
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><MapPin aria-hidden="true" size={15} className="text-slate-400" />{record.location}</p>
          {record.notes && <p className="mt-2 text-sm leading-5 text-slate-500">{record.notes}</p>}
        </li>
      ))}
    </ol>
  );
}

function OrderItemCard({ item, onRecordConsolidation }) {
  const fullyConsolidated = item.consolidatedQuantity === item.quantity;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Model number</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950">{item.modelNumber}</h3>
          {item.description && <p className="mt-1 text-sm text-slate-500">{item.description}</p>}
        </div>
        <OrderStatusBadge status={item.consolidationStatus} />
      </div>

      <dl className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">
        <div className="border-b border-r border-slate-100 p-4 sm:border-b-0">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ordered</dt>
          <dd className="mt-2 text-sm font-semibold text-slate-900">{item.quantity} {item.unit}</dd>
        </div>
        <div className="border-b border-slate-100 p-4 sm:border-b-0 sm:border-r">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unit price</dt>
          <dd className="mt-2 text-sm font-semibold text-slate-900">{formatRmb(item.unitPrice)}</dd>
        </div>
        <div className="border-r border-slate-100 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</dt>
          <dd className="mt-2 text-sm font-semibold text-slate-900">{formatRmb(item.amount)}</dd>
        </div>
        <div className="p-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Consolidated</dt>
          <dd className="mt-2 text-sm font-semibold text-slate-900">{item.consolidatedQuantity} / {item.quantity} {item.unit}</dd>
        </div>
      </dl>

      <section aria-labelledby={`consolidation-history-${item.id}`} className="bg-slate-50/60 px-6 py-5">
        <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h4 id={`consolidation-history-${item.id}`} className="text-sm font-semibold text-slate-900">Consolidation history</h4>
          <div className="text-left sm:text-right">
            <button
              type="button"
              onClick={() => onRecordConsolidation(item)}
              disabled={fullyConsolidated}
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              {fullyConsolidated ? "Consolidation Complete" : "Record Consolidation"}
            </button>
            {fullyConsolidated && <p className="mt-1.5 text-xs text-slate-500">All ordered units are consolidated.</p>}
          </div>
        </div>
        <ConsolidationHistory records={item.consolidationRecords} unit={item.unit} />
      </section>
    </article>
  );
}

export default function OrderItems({ items, onRecordConsolidation }) {
  return (
    <section aria-labelledby="order-items-heading">
      <div className="mb-4">
        <p className="text-sm font-semibold text-indigo-600">Goods and consolidation</p>
        <h2 id="order-items-heading" className="mt-1 text-xl font-semibold text-slate-950">Order items</h2>
      </div>
      <div className="space-y-5">
        {items.map((item) => <OrderItemCard key={item.id} item={item} onRecordConsolidation={onRecordConsolidation} />)}
      </div>
    </section>
  );
}
