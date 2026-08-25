import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatters";

function SupplierIdentity({ supplier }) {
  const initials = supplier.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-700">
        {initials || "S"}
      </span>
      <div>
        <p className="font-semibold text-slate-900">{supplier.name}</p>
        <p className="mt-0.5 text-xs text-slate-400">Supplier #{supplier.id}</p>
      </div>
    </div>
  );
}

export default function SupplierTable({ suppliers }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <h3 className="font-semibold text-slate-900">Supplier directory</h3>
          <p className="mt-1 text-xs text-slate-500">{suppliers.length} active {suppliers.length === 1 ? "supplier" : "suppliers"}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-3.5">Supplier</th>
              <th scope="col" className="px-6 py-3.5">Location</th>
              <th scope="col" className="px-6 py-3.5">Mobile Number</th>
              <th scope="col" className="px-6 py-3.5">Created</th>
              <th scope="col" className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="transition-colors hover:bg-slate-50/70">
                <td className="px-6 py-4"><SupplierIdentity supplier={supplier} /></td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <span className="flex items-center gap-2"><MapPin aria-hidden="true" size={16} className="text-slate-400" />{supplier.location || "Not provided"}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <span className="flex items-center gap-2"><Phone aria-hidden="true" size={16} className="text-slate-400" />{supplier.mobileNumber || "Not provided"}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{formatDate(supplier.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/suppliers/${supplier.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-semibold text-indigo-600 outline-none hover:bg-indigo-50 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    View Supplier <ArrowUpRight aria-hidden="true" size={15} />
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
