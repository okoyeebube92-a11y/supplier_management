import { ArrowLeft, PackageSearch } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function OrderDetailPlaceholder() {
  const { orderId } = useParams();

  return (
    <section>
      <PageHeader
        eyebrow={`Order #${orderId}`}
        title="Order detail coming next"
        description="The supplier order summary is connected. Full order, payment, and consolidation detail is intentionally deferred."
      />
      <div className="rounded-xl border border-slate-200 bg-white px-8 py-14 text-center shadow-sm">
        <PackageSearch aria-hidden="true" className="mx-auto text-indigo-300" size={42} />
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-500">
          No order data is fabricated on this screen. Return to the supplier directory to continue.
        </p>
        <Link
          to="/suppliers"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <ArrowLeft aria-hidden="true" size={16} /> Back to suppliers
        </Link>
      </div>
    </section>
  );
}
