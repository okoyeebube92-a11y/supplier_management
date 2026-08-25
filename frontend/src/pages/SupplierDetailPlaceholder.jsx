import { ArrowLeft, Building2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";

export default function SupplierDetailPlaceholder() {
  const { supplierId } = useParams();

  return (
    <section>
      <PageHeader
        eyebrow={`Supplier #${supplierId}`}
        title="Supplier detail coming next"
        description="The supplier directory is connected. Detailed supplier and order views are intentionally deferred to the next milestone."
      />
      <div className="rounded-xl border border-slate-200 bg-white px-8 py-14 text-center shadow-sm">
        <Building2 aria-hidden="true" className="mx-auto text-indigo-300" size={42} />
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-500">No supplier data is fabricated on this screen. Return to the live supplier directory to continue.</p>
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
