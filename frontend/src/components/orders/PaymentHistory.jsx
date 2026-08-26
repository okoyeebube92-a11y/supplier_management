import { CreditCard } from "lucide-react";
import { formatDate, formatRmb } from "../../utils/formatters";

export default function PaymentHistory({ payments }) {
  return (
    <section aria-labelledby="payment-history-heading" className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <p className="text-sm font-semibold text-indigo-600">Financial records</p>
        <h2 id="payment-history-heading" className="mt-1 font-semibold text-slate-900">Payment history</h2>
      </div>
      {payments.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <CreditCard aria-hidden="true" className="mx-auto text-slate-300" size={34} />
          <h3 className="mt-3 font-semibold text-slate-900">No payments recorded</h3>
          <p className="mt-2 text-sm text-slate-500">Payment records will appear here when they are available.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3.5">Payment Date</th>
                <th scope="col" className="px-6 py-3.5">Reference</th>
                <th scope="col" className="px-6 py-3.5">Notes</th>
                <th scope="col" className="px-6 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 text-sm text-slate-700"><time dateTime={payment.paymentDate}>{formatDate(payment.paymentDate)}</time></td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{payment.reference || "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{payment.notes || "—"}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-950">{formatRmb(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
