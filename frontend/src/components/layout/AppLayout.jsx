import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const location = useLocation();
  const title = location.pathname.match(/^\/suppliers\/[^/]+$/) ? "Supplier detail" : "Suppliers";

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
