import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createOrder } from "../api/orders";
import { getSupplierById } from "../api/suppliers";
import OrderItemFields from "../components/orders/OrderItemFields";
import { DetailError, DetailLoading, SupplierNotFound } from "../components/suppliers/SupplierDetailStates";

const positiveIntegerPattern = /^[1-9]\d*$/;
const decimalPattern = /^\d+(?:\.\d+)?$/;
const validSupplierId = (value) => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) <= 2147483647;

function getTodayForDateInput() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const makeItem = (key) => ({ key, modelNumber: "", description: "", quantity: "", unit: "", unitPrice: "" });

function getServerMessage(error) {
  if (error.status === 400) {
    if (error.details?.length) return error.details.join(" ");
    return "Check the order details and try again.";
  }
  if (error.status === 404) return "This supplier is no longer available.";
  if (error.status === 409) return "An order with this number already exists for this supplier.";
  if (error.status >= 500) return "The order service is temporarily unavailable. Please try again.";
  return "Unable to reach the order service. Check your connection and try again.";
}

function CreateOrderForm({ supplier, supplierId }) {
  const navigate = useNavigate();
  const nextItemKey = useRef(2);
  const submissionLock = useRef(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState(getTodayForDateInput);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([makeItem(1)]);
  const [errors, setErrors] = useState({ items: [{}] });
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => {
    setItems((current) => [...current, makeItem(nextItemKey.current++)]);
    setErrors((current) => ({ ...current, items: [...(current.items || []), {}] }));
  };

  const removeItem = (key) => {
    if (items.length === 1) return;
    const index = items.findIndex((item) => item.key === key);
    setItems((current) => current.filter((item) => item.key !== key));
    setErrors((current) => ({ ...current, items: (current.items || []).filter((_, errorIndex) => errorIndex !== index) }));
  };

  const updateItem = (key, field, value) => {
    setItems((current) => current.map((item) => item.key === key ? { ...item, [field]: value } : item));
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    if (submissionLock.current) return;

    const nextErrors = { items: items.map(() => ({})) };
    const trimmedOrderNumber = orderNumber.trim();
    if (!trimmedOrderNumber) nextErrors.orderNumber = "Order number is required.";
    if (!orderDate) nextErrors.orderDate = "Order date is required.";

    items.forEach((item, index) => {
      if (!item.modelNumber.trim()) nextErrors.items[index].modelNumber = "Model number is required.";
      if (!positiveIntegerPattern.test(item.quantity.trim())) nextErrors.items[index].quantity = "Enter a positive whole-number quantity.";
      if (!item.unit.trim()) nextErrors.items[index].unit = "Unit is required.";
      if (!decimalPattern.test(item.unitPrice.trim())) nextErrors.items[index].unitPrice = "Enter a non-negative decimal unit price.";
    });

    const hasItemErrors = nextErrors.items.some((itemErrors) => Object.keys(itemErrors).length > 0);
    setErrors(nextErrors);
    setServerError("");
    if (nextErrors.orderNumber || nextErrors.orderDate || hasItemErrors) return;

    const orderData = {
      orderNumber: trimmedOrderNumber,
      orderDate,
      currency: "RMB",
      items: items.map((item) => {
        const orderItem = {
          modelNumber: item.modelNumber.trim(),
          quantity: Number(item.quantity.trim()),
          unit: item.unit.trim(),
          unitPrice: item.unitPrice.trim(),
        };
        if (item.description.trim()) orderItem.description = item.description.trim();
        return orderItem;
      }),
    };
    if (notes.trim()) orderData.notes = notes.trim();

    submissionLock.current = true;
    setSubmitting(true);
    try {
      const createdOrder = await createOrder(supplierId, orderData);
      navigate(`/orders/${createdOrder.id}`);
    } catch (error) {
      submissionLock.current = false;
      setServerError(getServerMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-7">
      <Link to={`/suppliers/${supplierId}`} className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 outline-none hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
        <ArrowLeft aria-hidden="true" size={16} /> Back to Supplier
      </Link>

      <header>
        <p className="text-sm font-semibold text-indigo-600">New purchase order</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">Create Order</h1>
        <p className="mt-2 text-sm text-slate-500">Create an order and its initial item list for this supplier.</p>
      </header>

      <section aria-labelledby="order-supplier-heading" className="rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4">
        <h2 id="order-supplier-heading" className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Supplier</h2>
        <p className="mt-1 text-lg font-semibold text-slate-950">{supplier.name}</p>
        <p className="mt-1 text-sm text-slate-600">{supplier.location || "Location not provided"}</p>
      </section>

      <form onSubmit={submitOrder} noValidate className="space-y-7">
        {serverError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

        <section aria-labelledby="order-information-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 id="order-information-heading" className="text-lg font-semibold text-slate-950">Order Information</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="order-number" className="text-sm font-semibold text-slate-800">Order Number</label>
              <input id="order-number" type="text" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} aria-invalid={Boolean(errors.orderNumber)} aria-describedby={errors.orderNumber ? "order-number-error" : undefined} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              {errors.orderNumber && <p id="order-number-error" className="mt-1.5 text-sm text-red-600">{errors.orderNumber}</p>}
            </div>
            <div>
              <label htmlFor="order-date" className="text-sm font-semibold text-slate-800">Order Date</label>
              <input id="order-date" type="date" value={orderDate} onChange={(event) => setOrderDate(event.target.value)} aria-invalid={Boolean(errors.orderDate)} aria-describedby={errors.orderDate ? "order-date-error" : undefined} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              {errors.orderDate && <p id="order-date-error" className="mt-1.5 text-sm text-red-600">{errors.orderDate}</p>}
            </div>
            <div>
              <label htmlFor="order-currency" className="text-sm font-semibold text-slate-800">Currency</label>
              <input id="order-currency" type="text" value="RMB" readOnly aria-readonly="true" className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-semibold text-slate-700" />
            </div>
            <div>
              <label htmlFor="order-notes" className="text-sm font-semibold text-slate-800">Notes <span className="font-normal text-slate-400">(optional)</span></label>
              <textarea id="order-notes" rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
        </section>

        <section aria-labelledby="order-items-heading">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 id="order-items-heading" className="text-xl font-semibold text-slate-950">Order Items</h2>
              <p className="mt-1 text-sm text-slate-500">Add at least one item. Totals are calculated by the backend.</p>
            </div>
            <button type="button" onClick={addItem} className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 outline-none hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
              <Plus aria-hidden="true" size={17} /> Add Item
            </button>
          </div>
          <div className="space-y-4">
            {items.map((item, index) => (
              <OrderItemFields key={item.key} index={index} item={item} errors={errors.items?.[index] || {}} canRemove={items.length > 1} onChange={(field, value) => updateItem(item.key, field, value)} onRemove={() => removeItem(item.key)} />
            ))}
          </div>
        </section>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <Link to={`/suppliers/${supplierId}`} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">Cancel</Link>
          <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300">
            {submitting ? "Creating…" : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

function CreateOrderContent({ supplierId }) {
  const [supplier, setSupplier] = useState(null);
  const [status, setStatus] = useState("loading");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getSupplierById(supplierId, { signal: controller.signal })
      .then((data) => {
        setSupplier(data);
        setStatus("success");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus(error.status === 404 ? "not-found" : "error");
      });
    return () => controller.abort();
  }, [supplierId, requestVersion]);

  if (status === "loading") return <DetailLoading label="Loading supplier information" />;
  if (status === "not-found") return <SupplierNotFound />;
  if (status === "error") return <DetailError title="We couldn’t load this supplier" message="Check that the supplier service is available, then try again." onRetry={() => { setStatus("loading"); setRequestVersion((version) => version + 1); }} />;
  return <CreateOrderForm supplier={supplier} supplierId={supplierId} />;
}

export default function CreateOrderPage() {
  const { supplierId } = useParams();
  if (!validSupplierId(supplierId)) return <SupplierNotFound invalid />;
  return <CreateOrderContent key={supplierId} supplierId={supplierId} />;
}
