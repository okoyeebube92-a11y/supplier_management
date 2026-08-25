import { useCallback, useEffect, useState } from "react";
import { getSuppliers } from "../api/suppliers";
import PageHeader from "../components/PageHeader";
import { SupplierEmpty, SupplierError, SupplierLoading } from "../components/suppliers/SupplierStates";
import SupplierTable from "../components/suppliers/SupplierTable";

export default function SuppliersPage() {
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
      <PageHeader
        eyebrow="Supplier network"
        title="Suppliers"
        description="Review the businesses and contact information currently available in your supplier directory."
      />
      <span id="suppliers-heading" className="sr-only">Supplier directory</span>
      {status === "loading" && <SupplierLoading />}
      {status === "error" && <SupplierError onRetry={retry} />}
      {status === "success" && suppliers.length === 0 && <SupplierEmpty />}
      {status === "success" && suppliers.length > 0 && <SupplierTable suppliers={suppliers} />}
    </section>
  );
}
