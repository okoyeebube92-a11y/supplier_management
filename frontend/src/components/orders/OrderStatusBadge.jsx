const statusStyles = {
  UNPAID: "border-slate-200 bg-slate-100 text-slate-700",
  PARTIAL: "border-amber-200 bg-amber-50 text-amber-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING: "border-slate-200 bg-slate-100 text-slate-700",
  COMPLETE: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

export default function OrderStatusBadge({ status }) {
  const style = statusStyles[status] || "border-slate-200 bg-white text-slate-700";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>{status}</span>;
}
