import { ArrowLeft, Building2, CalendarDays, MapPin, Phone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSupplierById, getSupplierOrders } from "../api/suppliers";
import {
  DetailError,
  DetailLoading,
  OrdersEmpty,
  SupplierNotFound,
} from "../components/suppliers/SupplierDetailStates";
import SupplierOrdersTable from "../components/suppliers/SupplierOrdersTable";
import { formatDate } from "../utils/formatters";

const validSupplierId = (value) => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) <= 2147483647;

function SupplierInformation({ supplier }) {
  const details = [
    { label: "Location", value: supplier.location || "Not provided", icon: MapPin },
    { label: "Mobile number", value: supplier.mobileNumber || "Not provided", icon: Phone },
    { label: "Supplier ID", value: `#${supplier.id}`, icon: Building2 },
    { label: "Created", value: formatDate(supplier.createdAt), icon: CalendarDays },
  ];

  return (
    <section aria-labelledby="supplier-name" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
          <Building2 aria-hidden="true" size={24} />
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-600">Supplier profile</p>
          <h2 id="supplier-name" className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{supplier.name}</h2>
        </div>
      </div>
      <dl className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {details.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><Icon aria-hidden="true" size={15} />{label}</dt>
            <dd className="mt-2 text-sm font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SupplierDetailContent({ supplierId }) {
  const [supplier, setSupplier] = useState(null);
  const [orders, setOrders] = useState([]);
  const [supplierStatus, setSupplierStatus] = useState("loading");
  const [ordersStatus, setOrdersStatus] = useState("loading");
  const [supplierRequest, setSupplierRequest] = useState(0);
  const [ordersRequest, setOrdersRequest] = useState(0);

  const retrySupplier = useCallback(() => {
    setSupplierStatus("loading");
    setSupplierRequest((request) => request + 1);
  }, []);
  const retryOrders = useCallback(() => {
    setOrdersStatus("loading");
    setOrdersRequest((request) => request + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getSupplierById(supplierId, { signal: controller.signal })
      .then((data) => {
        setSupplier(data);
        setSupplierStatus("success");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setSupplierStatus(error.status === 404 ? "not-found" : "error");
        }
      });
    return () => controller.abort();
  }, [supplierId, supplierRequest]);

  useEffect(() => {
    const controller = new AbortController();
    getSupplierOrders(supplierId, { signal: controller.signal })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Unexpected orders response.");
        setOrders(data);
        setOrdersStatus("success");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setOrdersStatus("error");
      });
    return () => controller.abort();
  }, [supplierId, ordersRequest]);

  if (supplierStatus === "not-found") return <SupplierNotFound />;

  return (
    <div className="space-y-7">
      <Link to="/suppliers" className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 outline-none hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
        <ArrowLeft aria-hidden="true" size={16} /> Back to suppliers
      </Link>

      {supplierStatus === "loading" && <DetailLoading label="Loading supplier information" />}
      {supplierStatus === "error" && <DetailError title="We couldn’t load this supplier" message="Check that the supplier service is available, then try again." onRetry={retrySupplier} />}
      {supplierStatus === "success" && <SupplierInformation supplier={supplier} />}

      <section aria-labelledby="supplier-orders-heading">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Order history</p>
            <h2 id="supplier-orders-heading" className="mt-1 text-xl font-semibold text-slate-950">Supplier orders</h2>
          </div>
          {supplierStatus === "success" && (
            <Link to={`/suppliers/${supplierId}/orders/new`} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
              Create Order
            </Link>
          )}
        </div>
        {ordersStatus === "loading" && <DetailLoading label="Loading supplier orders" />}
        {ordersStatus === "error" && <DetailError title="We couldn’t load supplier orders" message="Supplier information is available, but the order history could not be loaded." onRetry={retryOrders} />}
        {ordersStatus === "success" && orders.length === 0 && <OrdersEmpty />}
        {ordersStatus === "success" && orders.length > 0 && <SupplierOrdersTable orders={orders} />}
      </section>
    </div>
  );
}

export default function SupplierDetailPage() {
  const { supplierId } = useParams();
  if (!validSupplierId(supplierId)) return <SupplierNotFound invalid />;
  return <SupplierDetailContent key={supplierId} supplierId={supplierId} />;
}
