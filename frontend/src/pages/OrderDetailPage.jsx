import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderById } from "../api/orders";
import { OrderDetailFailure, OrderDetailLoading } from "../components/orders/OrderDetailStates";
import OrderItems from "../components/orders/OrderItems";
import OrderSummary from "../components/orders/OrderSummary";
import PaymentHistory from "../components/orders/PaymentHistory";
import RecordConsolidationDialog from "../components/orders/RecordConsolidationDialog";
import RecordPaymentDialog from "../components/orders/RecordPaymentDialog";

const validOrderId = (value) => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) <= 2147483647;

function OrderDetailContent({ orderId }) {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [requestVersion, setRequestVersion] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [consolidationItem, setConsolidationItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const recordPaymentButtonRef = useRef(null);

  const retry = useCallback(() => {
    setStatus("loading");
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getOrderById(orderId, { signal: controller.signal })
      .then((data) => {
        setOrder(data);
        setStatus("success");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setStatus(error.status === 404 ? "not-found" : "error");
      });
    return () => controller.abort();
  }, [orderId, requestVersion]);

  if (status === "loading") return <OrderDetailLoading />;
  if (status === "not-found") return <OrderDetailFailure notFound />;
  if (status === "error") return <OrderDetailFailure onRetry={retry} />;

  const paymentRecorded = () => {
    setPaymentDialogOpen(false);
    setSuccessMessage("Payment recorded successfully.");
    setRequestVersion((version) => version + 1);
  };

  const consolidationRecorded = () => {
    setConsolidationItem(null);
    setSuccessMessage("Consolidation recorded successfully.");
    setRequestVersion((version) => version + 1);
  };

  return (
    <div className="space-y-7">
      {successMessage && (
        <div role="status" className="flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <span>{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage("")} className="rounded px-2 py-1 text-xs font-semibold outline-none hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-600">Dismiss</button>
        </div>
      )}
      <OrderSummary order={order} onRecordPayment={() => setPaymentDialogOpen(true)} recordPaymentButtonRef={recordPaymentButtonRef} />
      <OrderItems items={order.items} onRecordConsolidation={setConsolidationItem} />
      <PaymentHistory payments={order.payments} />
      {paymentDialogOpen && (
        <RecordPaymentDialog
          orderId={orderId}
          outstandingBalance={order.outstandingBalance}
          onClose={() => setPaymentDialogOpen(false)}
          onSuccess={paymentRecorded}
        />
      )}
      {consolidationItem && (
        <RecordConsolidationDialog
          orderId={orderId}
          item={consolidationItem}
          onClose={() => setConsolidationItem(null)}
          onSuccess={consolidationRecorded}
        />
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams();
  if (!validOrderId(orderId)) return <OrderDetailFailure invalid />;
  return <OrderDetailContent key={orderId} orderId={orderId} />;
}
