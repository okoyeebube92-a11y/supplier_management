import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const location = useLocation();
  let title = "Suppliers";
  if (location.pathname.match(/^\/suppliers\/[^/]+$/)) {
    title = "Supplier detail";
  } else if (location.pathname.match(/^\/orders\/[^/]+$/)) {
    title = "Order detail";
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="min-h-screen pl-20 lg:pl-64">
        <Header title={title} />
        <main className="px-6 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
