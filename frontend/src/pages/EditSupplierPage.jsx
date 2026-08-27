import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSupplierById, updateSupplier } from "../api/suppliers";
import SupplierForm from "../components/suppliers/SupplierForm";
import { DetailError, DetailLoading, SupplierNotFound } from "../components/suppliers/SupplierDetailStates";

const validSupplierId = (value) => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) <= 2147483647;

function EditSupplierContent({ supplierId }) {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [status, setStatus] = useState("loading");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getSupplierById(supplierId, { signal: controller.signal })
      .then((data) => { setSupplier(data); setStatus("success"); })
      .catch((error) => { if (error.name !== "AbortError") setStatus(error.status === 404 ? "not-found" : "error"); });
    return () => controller.abort();
  }, [supplierId, requestVersion]);

  if (status === "loading") return <DetailLoading label="Loading supplier information" />;
  if (status === "not-found") return <SupplierNotFound />;
  if (status === "error") return <DetailError title="We couldn’t load this supplier" message="Check that the supplier service is available, then try again." onRetry={() => { setStatus("loading"); setRequestVersion((version) => version + 1); }} />;

  return (
    <div className="space-y-7">
      <Link to={`/suppliers/${supplierId}`} className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 outline-none hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><ArrowLeft aria-hidden="true" size={16} /> Back to Supplier</Link>
      <header>
        <p className="text-sm font-semibold text-indigo-600">Supplier directory</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Edit Supplier</h1>
        <p className="mt-2 text-sm text-slate-500">Update contact information for {supplier.name}.</p>
      </header>
      <SupplierForm key={supplier.id} mode="edit" initialValues={supplier} cancelTo={`/suppliers/${supplierId}`} onSubmit={async (supplierData) => {
        await updateSupplier(supplierId, supplierData);
        navigate(`/suppliers/${supplierId}`, { state: { successMessage: "Supplier updated successfully." } });
      }} />
    </div>
  );
}

export default function EditSupplierPage() {
  const { supplierId } = useParams();
  if (!validSupplierId(supplierId)) return <SupplierNotFound invalid />;
  return <EditSupplierContent key={supplierId} supplierId={supplierId} />;
}
