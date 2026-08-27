import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getOrderById, updateOrder } from "../api/orders";
import OrderItemFields from "../components/orders/OrderItemFields";
import { OrderDetailFailure, OrderDetailLoading } from "../components/orders/OrderDetailStates";

const positiveIntegerPattern = /^[1-9]\d*$/;
const decimalPattern = /^\d+(?:\.\d+)?$/;
const validOrderId = (value) => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) <= 2147483647;

const newItem = (key) => ({ key, modelNumber: "", description: "", quantity: "", unit: "", unitPrice: "" });

function conflictMessage(error) {
  const messages = {
    "Item quantity cannot be reduced below the quantity already consolidated.": "This quantity cannot be reduced below the quantity already consolidated.",
    "Item cannot be removed because consolidation history already exists.": "This item cannot be removed because consolidation history already exists.",
    "Order total cannot be reduced below the amount already paid.": "This correction would reduce the order total below the amount already paid.",
    "Order number already exists for this supplier.": "An order with this number already exists for this supplier.",
  };
  if (error.status === 409) return messages[error.message] || "This correction conflicts with existing order history.";
  if (error.status === 400) return error.details?.length ? error.details.join(" ") : "Check the order details and try again.";
  if (error.status === 404) return "This order or one of its items is no longer available.";
  if (error.status >= 500) return "The order service is temporarily unavailable. Please try again.";
  return "Unable to reach the order service. Check your connection and try again.";
}

function EditOrderForm({ order }) {
  const navigate = useNavigate();
  const nextKey = useRef(1);
  const lock = useRef(false);
  const [orderNumber, setOrderNumber] = useState(order.orderNumber);
  const [orderDate, setOrderDate] = useState(order.orderDate.slice(0, 10));
  const [notes, setNotes] = useState(order.notes || "");
  const [items, setItems] = useState(order.items.map((item) => ({ ...item, key: `existing-${item.id}`, quantity: String(item.quantity) })));
  const [errors, setErrors] = useState({ items: order.items.map(() => ({})) });
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => {
    setItems((current) => [...current, newItem(`new-${nextKey.current++}`)]);
    setErrors((current) => ({ ...current, items: [...current.items, {}] }));
  };
  const removeItem = (key) => {
    if (items.length === 1) return;
    const index = items.findIndex((item) => item.key === key);
    setItems((current) => current.filter((item) => item.key !== key));
    setErrors((current) => ({ ...current, items: current.items.filter((_, errorIndex) => errorIndex !== index) }));
  };
  const changeItem = (key, field, value) => setItems((current) => current.map((item) => item.key === key ? { ...item, [field]: value } : item));

  const submit = async (event) => {
    event.preventDefault();
    if (lock.current) return;
    const nextErrors = { items: items.map(() => ({})) };
    if (!orderNumber.trim()) nextErrors.orderNumber = "Order number is required.";
    if (!orderDate) nextErrors.orderDate = "Order date is required.";
    items.forEach((item, index) => {
      if (!item.modelNumber.trim()) nextErrors.items[index].modelNumber = "Model number is required.";
      if (!positiveIntegerPattern.test(item.quantity.trim())) nextErrors.items[index].quantity = "Enter a positive whole-number quantity.";
      if (!item.unit.trim()) nextErrors.items[index].unit = "Unit is required.";
      if (!decimalPattern.test(item.unitPrice.trim())) nextErrors.items[index].unitPrice = "Enter a non-negative decimal unit price.";
    });
    setErrors(nextErrors);
    setServerError("");
    if (nextErrors.orderNumber || nextErrors.orderDate || nextErrors.items.some((value) => Object.keys(value).length)) return;

    const payload = {
      orderNumber: orderNumber.trim(), orderDate, notes: notes.trim(),
      items: items.map((item) => {
        const value = { modelNumber: item.modelNumber.trim(), description: item.description.trim(), quantity: Number(item.quantity), unit: item.unit.trim(), unitPrice: item.unitPrice.trim() };
        if (item.id) value.id = item.id;
        return value;
      })
    };
    lock.current = true;
    setSubmitting(true);
    try {
      await updateOrder(order.id, payload);
      navigate(`/orders/${order.id}`, { state: { successMessage: "Order corrected successfully." } });
    } catch (error) {
      lock.current = false;
      setSubmitting(false);
      setServerError(conflictMessage(error));
    }
  };

  return (
    <div className="space-y-7">
      <Link to={`/orders/${order.id}`} className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-600 outline-none hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500"><ArrowLeft aria-hidden="true" size={16} /> Back to Order</Link>
      <header><p className="text-sm font-semibold text-indigo-600">Order correction</p><h1 className="mt-1 text-3xl font-semibold text-slate-950">Edit Order</h1><p className="mt-2 text-sm text-slate-500">Correct order details without rewriting payment or consolidation history.</p></header>
      <section className="rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4" aria-labelledby="edit-order-supplier"><h2 id="edit-order-supplier" className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Supplier</h2><p className="mt-1 text-lg font-semibold text-slate-950">{order.supplier.name}</p><p className="mt-1 text-sm text-slate-600">Currency: RMB · Supplier relationship cannot be changed</p></section>
      <form onSubmit={submit} noValidate className="space-y-7">
        {serverError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="edit-order-info"><h2 id="edit-order-info" className="text-lg font-semibold text-slate-950">Order Information</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="edit-order-number" className="text-sm font-semibold text-slate-800">Order Number</label><input id="edit-order-number" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} aria-invalid={Boolean(errors.orderNumber)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100" />{errors.orderNumber && <p className="mt-1 text-sm text-red-600">{errors.orderNumber}</p>}</div>
          <div><label htmlFor="edit-order-date" className="text-sm font-semibold text-slate-800">Order Date</label><input id="edit-order-date" type="date" value={orderDate} onChange={(event) => setOrderDate(event.target.value)} aria-invalid={Boolean(errors.orderDate)} aria-describedby={errors.orderDate ? "edit-order-date-error" : undefined} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100" />{errors.orderDate && <p id="edit-order-date-error" className="mt-1 text-sm text-red-600">{errors.orderDate}</p>}</div>
          <div><label htmlFor="edit-order-currency" className="text-sm font-semibold text-slate-800">Currency</label><input id="edit-order-currency" value="RMB" readOnly className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-semibold" /></div>
          <div><label htmlFor="edit-order-notes" className="text-sm font-semibold text-slate-800">Notes</label><textarea id="edit-order-notes" rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100" /></div>
        </div></section>
        <section aria-labelledby="edit-items"><div className="mb-4 flex justify-between gap-3"><div><h2 id="edit-items" className="text-xl font-semibold text-slate-950">Order Items</h2><p className="mt-1 text-sm text-slate-500">Historical safeguards are enforced by the backend.</p></div><button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500"><Plus aria-hidden="true" size={17} /> Add Item</button></div>
          <div className="space-y-4">{items.map((item, index) => <OrderItemFields key={item.key} index={index} item={item} errors={errors.items[index]} canRemove={items.length > 1} onChange={(field, value) => changeItem(item.key, field, value)} onRemove={() => removeItem(item.key)} />)}</div>
        </section>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-6"><Link to={`/orders/${order.id}`} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500">Cancel</Link><button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:bg-indigo-300">{submitting ? "Saving…" : "Save Corrections"}</button></div>
      </form>
    </div>
  );
}

export default function EditOrderPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    if (!validOrderId(orderId)) return;
    const controller = new AbortController();
    getOrderById(orderId, { signal: controller.signal }).then((data) => { setOrder(data); setStatus("success"); }).catch((error) => { if (error.name !== "AbortError") setStatus(error.status === 404 ? "not-found" : "error"); });
    return () => controller.abort();
  }, [orderId]);
  if (!validOrderId(orderId)) return <OrderDetailFailure invalid />;
  if (status === "loading") return <OrderDetailLoading />;
  if (status === "not-found") return <OrderDetailFailure notFound />;
  if (status === "error") return <OrderDetailFailure />;
  return <EditOrderForm key={order.id} order={order} />;
}
