import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createSupplier } from "../api/suppliers";
import SupplierForm from "../components/suppliers/SupplierForm";

export default function CreateSupplierPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-7">
      <Link to="/suppliers" className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 outline-none hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><ArrowLeft aria-hidden="true" size={16} /> Back to suppliers</Link>
      <header>
        <p className="text-sm font-semibold text-indigo-600">Supplier directory</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Create Supplier</h1>
        <p className="mt-2 text-sm text-slate-500">Add a supplier and its current contact information.</p>
      </header>
      <SupplierForm mode="create" cancelTo="/suppliers" onSubmit={async (supplierData) => {
        const supplier = await createSupplier(supplierData);
        navigate(`/suppliers/${supplier.id}`, { state: { successMessage: "Supplier created successfully." } });
      }} />
    </div>
  );
}
