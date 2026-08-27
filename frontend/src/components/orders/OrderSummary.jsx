import { CalendarDays, CircleDollarSign, FileText, Landmark, PackageCheck, ReceiptText, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, formatRmb } from "../../utils/formatters";
import OrderStatusBadge from "./OrderStatusBadge";

const isZeroDecimal = (value) => typeof value === "string" && /^0+(?:\.0+)?$/.test(value);

export default function OrderSummary({ order, onRecordPayment, recordPaymentButtonRef }) {
  const fullyPaid = isZeroDecimal(order.outstandingBalance);
  return (
    <>
      <section aria-labelledby="order-number" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Purchase order</p>
            <h2 id="order-number" className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{order.orderNumber}</h2>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><CalendarDays aria-hidden="true" size={16} />{formatDate(order.orderDate)}</span>
              <span className="inline-flex items-center gap-2"><CircleDollarSign aria-hidden="true" size={16} />Currency: RMB</span>
              <Link to={`/suppliers/${order.supplier.id}`} className="rounded text-sm font-semibold text-indigo-600 outline-none hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500">
                {order.supplier.name}
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/orders/${order.id}/edit`} className="inline-flex self-start rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500">Edit Order</Link>
            <Link to={`/suppliers/${order.supplier.id}`} className="inline-flex self-start rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 outline-none hover:border-indigo-200 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500">Back to supplier</Link>
          </div>
        </div>
        {order.notes && (
          <div className="mt-6 flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <FileText aria-hidden="true" className="mt-0.5 shrink-0 text-slate-400" size={17} />
            <p><span className="font-semibold text-slate-800">Order notes:</span> {order.notes}</p>
          </div>
        )}
      </section>

      <section aria-labelledby="order-progress-heading" className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 id="order-progress-heading" className="font-semibold text-slate-900">Financial and fulfillment summary</h2>
            <p className="mt-1 text-xs text-slate-500">Payment and consolidation are tracked independently.</p>
          </div>
          <div className="text-left sm:text-right">
            <button
              ref={recordPaymentButtonRef}
              type="button"
              onClick={onRecordPayment}
              disabled={fullyPaid}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              {fullyPaid ? "Order Paid" : "Record Payment"}
            </button>
            {fullyPaid && <p className="mt-1.5 text-xs text-slate-500">No outstanding balance.</p>}
          </div>
        </div>
        <dl className="grid sm:grid-cols-2 xl:grid-cols-5">
          <div className="border-b border-slate-100 p-5 sm:border-r xl:border-b-0">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><ReceiptText aria-hidden="true" size={15} />Total</dt>
            <dd className="mt-2 text-xl font-semibold text-slate-950">{formatRmb(order.totalAmount)}</dd>
          </div>
          <div className="border-b border-slate-100 p-5 xl:border-b-0 xl:border-r">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><WalletCards aria-hidden="true" size={15} />Paid</dt>
            <dd className="mt-2 text-xl font-semibold text-slate-950">{formatRmb(order.amountPaid)}</dd>
          </div>
          <div className="border-b border-slate-100 p-5 sm:border-r xl:border-b-0">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><Landmark aria-hidden="true" size={15} />Outstanding</dt>
            <dd className="mt-2 text-xl font-semibold text-slate-950">{formatRmb(order.outstandingBalance)}</dd>
          </div>
          <div className="border-b border-slate-100 p-5 xl:border-b-0 xl:border-r">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Status</dt>
            <dd className="mt-3"><OrderStatusBadge status={order.paymentStatus} /></dd>
          </div>
          <div className="p-5">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><PackageCheck aria-hidden="true" size={15} />Consolidation Status</dt>
            <dd className="mt-3"><OrderStatusBadge status={order.consolidationStatus} /></dd>
          </div>
        </dl>
      </section>
    </>
  );
}
