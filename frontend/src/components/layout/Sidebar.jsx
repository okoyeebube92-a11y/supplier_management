import { Building2, CreditCard, LayoutDashboard, PackageSearch, Truck } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, disabled: true },
  { label: "Suppliers", icon: Building2, to: "/suppliers" },
  { label: "Orders", icon: PackageSearch, disabled: true },
  { label: "Payments", icon: CreditCard, disabled: true },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-20 flex-col bg-slate-950 text-slate-300 lg:w-64">
      <div className="flex h-20 items-center border-b border-slate-800 px-5 lg:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-950/30">
          <Truck aria-hidden="true" size={21} strokeWidth={2.2} />
        </div>
        <div className="ml-3 hidden lg:block">
          <p className="text-base font-semibold tracking-tight text-white">SupplyDesk</p>
          <p className="text-xs text-slate-500">Operations</p>
        </div>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 px-3 py-7 lg:px-4">
        <p className="mb-3 hidden px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 lg:block">
          Workspace
        </p>
        <ul className="space-y-2">
          {navigation.map(({ label, icon: Icon, to, disabled }) => (
            <li key={label}>
              {disabled ? (
                <span
                  aria-disabled="true"
                  title={`${label} coming soon`}
                  className="flex cursor-not-allowed items-center justify-center gap-3 rounded-lg px-3 py-3 text-slate-600 lg:justify-start"
                >
                  <Icon aria-hidden="true" size={20} />
                  <span className="hidden text-sm font-medium lg:inline">{label}</span>
                </span>
              ) : (
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center justify-center gap-3 rounded-lg px-3 py-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 lg:justify-start ${
                      isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`
                  }
                >
                  <Icon aria-hidden="true" size={20} />
                  <span className="hidden lg:inline">{label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-slate-800 p-4 text-center lg:text-left">
        <p className="hidden text-xs leading-5 text-slate-500 lg:block">Supplier management workspace</p>
        <Building2 aria-hidden="true" className="mx-auto text-slate-600 lg:hidden" size={18} />
      </div>
    </aside>
  );
}
