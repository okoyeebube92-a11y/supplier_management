import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, formatRmb } from "../../utils/formatters";

const statusStyles = {
  UNPAID: "border-slate-200 bg-slate-100 text-slate-700",
  PARTIAL: "border-amber-200 bg-amber-50 text-amber-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING: "border-slate-200 bg-slate-100 text-slate-700",
  COMPLETE: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

function StatusBadge({ status }) {
  const style = statusStyles[status] || "border-slate-200 bg-white text-slate-700";
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}

export default function SupplierOrdersTable({ orders }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h3 className="font-semibold text-slate-900">Orders</h3>
        <p className="mt-1 text-xs text-slate-500">{orders.length} {orders.length === 1 ? "order" : "orders"} from this supplier</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3.5">Order Number</th>
              <th scope="col" className="px-5 py-3.5">Order Date</th>
              <th scope="col" className="px-5 py-3.5 text-right">Total</th>
              <th scope="col" className="px-5 py-3.5 text-right">Paid</th>
              <th scope="col" className="px-5 py-3.5 text-right">Outstanding</th>
              <th scope="col" className="px-5 py-3.5">Payment Status</th>
              <th scope="col" className="px-5 py-3.5">Consolidation Status</th>
              <th scope="col" className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order, index) => (
              <tr key={order.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                  {index === 0 && <span className="mt-1 inline-block text-xs font-semibold text-indigo-600">Most Recent Order</span>}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">{formatDate(order.orderDate)}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">{formatRmb(order.totalAmount)}</td>
                <td className="px-5 py-4 text-right text-sm text-slate-700">{formatRmb(order.amountPaid)}</td>
                <td className="px-5 py-4 text-right text-sm text-slate-700">{formatRmb(order.outstandingBalance)}</td>
                <td className="px-5 py-4"><StatusBadge status={order.paymentStatus} /></td>
                <td className="px-5 py-4"><StatusBadge status={order.consolidationStatus} /></td>
                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-semibold text-indigo-600 outline-none hover:bg-indigo-50 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    View Order <ArrowUpRight aria-hidden="true" size={15} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
