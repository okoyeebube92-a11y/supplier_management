import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getSuppliers } from "../api/suppliers";
import PageHeader from "../components/PageHeader";
import { SupplierEmpty, SupplierError, SupplierLoading } from "../components/suppliers/SupplierStates";
import SupplierTable from "../components/suppliers/SupplierTable";

export default function SuppliersPage() {
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [requestVersion, setRequestVersion] = useState(0);

  const retry = useCallback(() => {
    setStatus("loading");
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getSuppliers({ signal: controller.signal })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Unexpected supplier response.");
        }
        setSuppliers(data);
        setStatus("success");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setStatus("error");
        }
      });

    return () => controller.abort();
  }, [requestVersion]);

  return (
    <section aria-labelledby="suppliers-heading">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeader
          eyebrow="Supplier network"
          title="Suppliers"
          description="Review the businesses and contact information currently available in your supplier directory."
        />
        <Link to="/suppliers/new" className="mt-1 inline-flex shrink-0 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">Create Supplier</Link>
      </div>
      {location.state?.successMessage && <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{location.state.successMessage}</p>}
      <span id="suppliers-heading" className="sr-only">Supplier directory</span>
      {status === "loading" && <SupplierLoading />}
      {status === "error" && <SupplierError onRetry={retry} />}
      {status === "success" && suppliers.length === 0 && <SupplierEmpty />}
      {status === "success" && suppliers.length > 0 && <SupplierTable suppliers={suppliers} />}
    </section>
  );
}
